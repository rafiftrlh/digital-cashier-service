import { Injectable } from '@nestjs/common';
import { Prisma, OrderItem } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { DiscountsService } from '../discounts/discounts.service';

@Injectable()
export class OrderItemsService {
     constructor(
          private prisma: PrismaService,
          private discountService: DiscountsService
     ) { }

     async findByOrder(orderId: number): Promise<OrderItem[]> {
          return this.prisma.orderItem.findMany({
               where: { orderId },
               include: {
                    product: true,
               },
          });
     }

     async create(
          data: Prisma.OrderItemUncheckedCreateInput,
     ): Promise<OrderItem> {
          return this.prisma.orderItem.create({
               data,
               include: {
                    product: true,
               },
          });
     }

     async createMany(
          items: Prisma.OrderItemUncheckedCreateInput[],
     ): Promise<Prisma.BatchPayload> {
          return this.prisma.orderItem.createMany({
               data: items,
          });
     }

     async update(
          id: number,
          data: Prisma.OrderItemUpdateInput,
     ): Promise<OrderItem> {
          return this.prisma.orderItem.update({
               where: { id },
               data,
               include: {
                    product: true,
               },
          });
     }

     async remove(id: number): Promise<OrderItem> {
          return this.prisma.orderItem.delete({
               where: { id },
          });
     }

     async calculateItemSubtotal(
          productId: number,
          quantity: number,
          unitPrice: number,
     ): Promise<{
          subtotal: number;
          discountAmount: number;
          discountId: number | null;
     }> {
          // Calculate discount using the discount service
          const { discountAmount, discountId } = await this.discountService.calculateDiscount(
               productId,
               quantity,
               unitPrice,
          );

          // Calculate subtotal (unit price * quantity - discount)
          const subtotal = unitPrice * quantity - discountAmount;

          return {
               subtotal,
               discountAmount,
               discountId,
          };
     }
}