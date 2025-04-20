import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReportsService {
     constructor(private prisma: PrismaService) { }

     async getOrderReport(startDate: string, endDate: string, status?: string) {
          const where: any = {
               deletedAt: null,
               createdAt: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
               },
          };

          if (status) where.status = status;

          const orders = await this.prisma.order.findMany({
               where,
               include: {
                    orderItems: true,
                    orderDiscounts: true,
               },
          });

          return orders.map(order => ({
               orderNumber: order.orderNumber,
               createdAt: order.createdAt,
               subtotal: order.subtotal.toNumber(),
               discountAmount: order.discountAmount.toNumber(),
               taxAmount: order.taxAmount.toNumber(),
               totalAmount: order.totalAmount.toNumber(),
               status: order.status,
          }));
     }
}
