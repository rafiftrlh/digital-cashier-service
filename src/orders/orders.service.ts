import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Order, OrderStatus, OrderType, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderItemsService } from './order-items.service';
import { v4 as uuidv4 } from 'uuid';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
     constructor(
          private prisma: PrismaService,
          private orderItemsService: OrderItemsService
     ) { }

     async findAll(): Promise<Order[]> {
          return this.prisma.order.findMany({
               where: {
                    deletedAt: null,
               },
               include: {
                    cashier: {
                         select: {
                              id: true,
                              username: true,
                         },
                    },
                    orderItems: {
                         include: {
                              product: true,
                         },
                    },
                    orderDiscounts: {
                         include: {
                              discount: true,
                         },
                    },
                    payments: true,
               },
               orderBy: {
                    createdAt: 'desc',
               },
          });
     }

     async findOne(id: number): Promise<Order | null> {
          return this.prisma.order.findUnique({
               where: { id },
               include: {
                    cashier: {
                         select: {
                              id: true,
                              username: true,
                         },
                    },
                    orderItems: {
                         include: {
                              product: true,
                         },
                    },
                    orderDiscounts: {
                         include: {
                              discount: true,
                         },
                    },
                    payments: true,
               },
          });
     }

     async findByStatus(status: OrderStatus): Promise<Order[]> {
          return this.prisma.order.findMany({
               where: {
                    status,
                    deletedAt: null,
               },
               include: {
                    cashier: {
                         select: {
                              id: true,
                              username: true,
                         },
                    },
                    orderItems: {
                         include: {
                              product: true,
                         },
                    },
                    orderDiscounts: {
                         include: {
                              discount: true,
                         },
                    },
                    payments: true,
               },
               orderBy: {
                    createdAt: 'desc',
               },
          });
     }

     async create(data: CreateOrderDto): Promise<Order> {
          const { items, ...orderData } = data;

          if (!items || items.length === 0) {
               throw new BadRequestException('Order must have at least one item');
          }

          return this.prisma.$transaction(async (prisma) => {
               // Generate order number (could be customized based on your requirements)
               const orderNumber = `ORD-${uuidv4().substring(0, 8).toUpperCase()}`;

               // Initial order values
               let subtotal = 0;
               let discountAmount = 0;
               let taxAmount = 0;

               // Create the order first
               const order = await prisma.order.create({
                    data: {
                         ...orderData,
                         orderNumber,
                         subtotal: 0, // Temporary values, will update after calculating items
                         discountAmount: 0,
                         taxAmount: 0,
                         totalAmount: 0,
                         status: OrderStatus.PENDING,
                         orderItems: {
                              create: [],
                         },
                    },
               });

               // Process each order item
               const orderItemsData: any = [];
               const orderDiscounts = new Map();

               for (const item of items) {
                    // Get current product
                    const product = await prisma.product.findUnique({
                         where: { id: item.productId },
                    });

                    if (!product) {
                         throw new NotFoundException(`Product with ID ${item.productId} not found`);
                    }

                    if (product.stock < item.quantity) {
                         throw new BadRequestException(`Not enough stock for product ${product.name}`);
                    }

                    // Calculate discount
                    const { subtotal: itemSubtotal, discountAmount: itemDiscountAmount, discountId } =
                         await this.orderItemsService.calculateItemSubtotal(
                              item.productId,
                              item.quantity,
                              Number(product.price),
                         );

                    // Update product stock
                    await prisma.product.update({
                         where: { id: item.productId },
                         data: { stock: product.stock - item.quantity },
                    });

                    // Prepare order item data
                    orderItemsData.push({
                         orderId: order.id,
                         productId: item.productId,
                         quantity: item.quantity,
                         unitPrice: product.price,
                         discountAmount: itemDiscountAmount,
                         subtotal: itemSubtotal,
                         notes: item.notes,
                    });

                    // Track discount for the order
                    if (discountId) {
                         if (orderDiscounts.has(discountId)) {
                              orderDiscounts.set(
                                   discountId,
                                   orderDiscounts.get(discountId) + itemDiscountAmount
                              );
                         } else {
                              orderDiscounts.set(discountId, itemDiscountAmount);
                         }
                    }

                    // Add to order totals
                    subtotal += Number(product.price) * item.quantity;
                    discountAmount += itemDiscountAmount;
               }

               // Create all order items at once
               await prisma.orderItem.createMany({
                    data: orderItemsData,
               });

               // Create order discounts if any
               for (const [discountId, amountSaved] of orderDiscounts.entries()) {
                    await prisma.orderDiscount.create({
                         data: {
                              orderId: order.id,
                              discountId,
                              amountSaved,
                         },
                    });
               }

               // Calculate tax (you can adjust tax calculation logic)
               const taxRate = 0.11; // 11% tax (can be retrieved from settings)
               taxAmount = (subtotal - discountAmount) * taxRate;

               // Calculate total amount
               const totalAmount = subtotal - discountAmount + taxAmount;

               // Update order with final values
               const updatedOrder = await prisma.order.update({
                    where: { id: order.id },
                    data: {
                         subtotal,
                         discountAmount,
                         taxAmount,
                         totalAmount,
                    },
                    include: {
                         cashier: {
                              select: {
                                   id: true,
                                   username: true,
                              },
                         },
                         orderItems: {
                              include: {
                                   product: true,
                              },
                         },
                         orderDiscounts: {
                              include: {
                                   discount: true,
                              },
                         },
                    },
               });

               return updatedOrder;
          });
     }

     async updateStatus(
          id: number,
          status: OrderStatus,
     ): Promise<Order> {
          const order = await this.prisma.order.findUnique({
               where: { id },
          });

          if (!order) {
               throw new NotFoundException(`Order with ID ${id} not found`);
          }

          // Additional validation logic for status transitions
          if (order.status === OrderStatus.CANCELLED) {
               throw new BadRequestException('Cancelled orders cannot be updated');
          }

          if (order.status === OrderStatus.COMPLETED && status !== OrderStatus.CANCELLED) {
               throw new BadRequestException('Completed orders cannot be updated');
          }

          return this.prisma.order.update({
               where: { id },
               data: { status },
               include: {
                    cashier: {
                         select: {
                              id: true,
                              username: true,
                         },
                    },
                    orderItems: {
                         include: {
                              product: true,
                         },
                    },
                    orderDiscounts: {
                         include: {
                              discount: true,
                         },
                    },
                    payments: true,
               },
          });
     }

     async cancel(id: number): Promise<Order> {
          const order = await this.prisma.order.findUnique({
               where: { id },
               include: {
                    orderItems: true,
               },
          });

          if (!order) {
               throw new NotFoundException(`Order with ID ${id} not found`);
          }

          if (order.status === OrderStatus.COMPLETED) {
               throw new BadRequestException('Completed orders cannot be cancelled');
          }

          // Use transaction to ensure all operations succeed or fail together
          return this.prisma.$transaction(async (prisma) => {
               // Restore product stocks
               for (const item of order.orderItems) {
                    await prisma.product.update({
                         where: { id: item.productId },
                         data: {
                              stock: {
                                   increment: item.quantity,
                              },
                         },
                    });
               }

               // Update order status to CANCELLED
               return prisma.order.update({
                    where: { id },
                    data: {
                         status: OrderStatus.CANCELLED,
                         deletedAt: new Date(),
                    },
                    include: {
                         cashier: {
                              select: {
                                   id: true,
                                   username: true,
                              },
                         },
                         orderItems: {
                              include: {
                                   product: true,
                              },
                         },
                         orderDiscounts: {
                              include: {
                                   discount: true,
                              },
                         },
                         payments: true,
                    },
               });
          });
     }
}