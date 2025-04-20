import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { mapInvoiceFromOrder } from 'src/utils/invoice.mapper';

@Injectable()
export class InvoiceService {
     constructor(private prisma: PrismaService) { }

     async getInvoice(orderId: number) {
          const order = await this.prisma.order.findUnique({
               where: { id: orderId },
               include: {
                    orderItems: { include: { product: true } },
                    orderDiscounts: { include: { discount: true } },
                    payments: true,
               },
          });

          if (!order) {
               throw new NotFoundException('Order not found');
          }

          if (order.status !== 'PAID') {
               throw new BadRequestException('Invoice only available after payment is completed');
          }

          const payment = order.payments[0];

          return mapInvoiceFromOrder(order);
     }
}
