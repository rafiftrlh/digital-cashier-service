import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';
import { mapOrderToResponse } from 'src/utils/order.mapper';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateOrderDto) {
    const { items, ...orderData } = dto;

    if (items.length === 0) throw new BadRequestException('Order must contain at least one item.');

    const now = new Date();
    let subtotal = new Decimal(0);
    let discountAmount = new Decimal(0);
    const orderItemsData: Prisma.OrderItemCreateWithoutOrderInput[] = [];
    const orderDiscountsData: Prisma.OrderDiscountCreateWithoutOrderInput[] = [];

    for (const item of items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
        include: {
          productDiscounts: {
            where: {
              discount: {
                isActive: true,
                startDate: { lte: now },
                endDate: { gte: now },
              },
            },
            include: { discount: true },
          },
        },
      });

      if (!product) throw new BadRequestException(`Product ID ${item.productId} not found.`);

      const unitPrice = product.price;
      let itemDiscount = new Decimal(0);
      const activeDiscount = product.productDiscounts[0]?.discount;

      // Calculate item discount
      if (activeDiscount) {
        switch (activeDiscount.type) {
          case 'PERCENTAGE':
            itemDiscount = unitPrice.mul(activeDiscount.value!).div(100);
            break;
          case 'FIXED':
            itemDiscount = new Decimal(activeDiscount.value!);
            break;
        }

        orderDiscountsData.push({
          discount: { connect: { id: activeDiscount.id } },
          amountSaved: itemDiscount.mul(item.quantity),
        });
      }

      // Add original item to order
      const itemSubtotal = unitPrice.sub(itemDiscount).mul(item.quantity);
      subtotal = subtotal.add(itemSubtotal);
      discountAmount = discountAmount.add(itemDiscount.mul(item.quantity));

      orderItemsData.push({
        product: { connect: { id: item.productId } },
        quantity: item.quantity,
        unitPrice,
        discountAmount: itemDiscount,
        subtotal: itemSubtotal,
        notes: item.notes,
      });

      // Handle free products from BUY_X_GET_Y
      if (activeDiscount?.type === 'BUY_X_GET_Y' && activeDiscount.freeProduct) {
        const freeProduct = await this.prisma.product.findUnique({
          where: { id: activeDiscount.freeProduct },
        });

        if (freeProduct) {
          orderItemsData.push({
            product: { connect: { id: freeProduct.id } },
            quantity: 1,
            unitPrice: new Decimal(0),
            discountAmount: freeProduct.price,
            subtotal: new Decimal(0),
            notes: '[FREE PRODUCT]',
          });

          orderDiscountsData.push({
            discount: { connect: { id: activeDiscount.id } },
            amountSaved: freeProduct.price,
          });

          discountAmount = discountAmount.add(freeProduct.price);
        }
      }
    }

    const taxRate = new Decimal(2);
    const taxAmount = subtotal.mul(taxRate).div(100);
    const totalAmount = subtotal.add(taxAmount);
    const orderNumber = 'ORD-' + Date.now();

    return this.prisma.order.create({
      data: {
        ...orderData,
        orderNumber,
        subtotal,
        discountAmount,
        taxAmount,
        totalAmount,
        status: 'PENDING',
        orderItems: { create: orderItemsData },
        orderDiscounts: { create: orderDiscountsData },
      },
      include: {
        orderItems: true,
        orderDiscounts: true,
      },
    });
  }

  async findAll() {
    const orders = await this.prisma.order.findMany({
      where: { deletedAt: null },
      include: {
        orderItems: { include: { product: true } },
        orderDiscounts: { include: { discount: true } },
      },
    });

    return orders.map(mapOrderToResponse);
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
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

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found.`);
    }

    return mapOrderToResponse(order);
  }

  async updateStatus(id: number, status: 'PAID' | 'COMPLETED' | 'CANCELLED') {
    const validStatus = ['PAID', 'COMPLETED', 'CANCELLED'];
    if (!validStatus.includes(status)) {
      throw new BadRequestException('Invalid status value.');
    }

    const order = await this.prisma.order.update({
      where: { id },
      data: { status },
      include: {
        orderItems: { include: { product: true } },
        orderDiscounts: { include: { discount: true } },
      },
    });

    return mapOrderToResponse(order);
  }

  async delete(id: number) {
    const now = new Date();

    return this.prisma.order.update({
      where: { id },
      data: { deletedAt: now },
      include: {
        orderItems: { include: { product: true } },
        orderDiscounts: { include: { discount: true } },
      },
    });
  }
}
