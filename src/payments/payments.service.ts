import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreatePaymentDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
    });

    if (!order) throw new BadRequestException('Order not found');

    if (order.status !== 'PENDING') {
      throw new BadRequestException('Order already paid or completed');
    }

    const total = order.totalAmount.toNumber();
    const amountPaid = dto.amount;
    let change = 0;

    if (dto.paymentMethod === 'QRIS') {
      if (amountPaid !== total) {
        throw new BadRequestException('QRIS payment must match total amount exactly');
      }
    }

    if (dto.paymentMethod === 'CASH') {
      if (amountPaid < total) {
        throw new BadRequestException('Cash payment is less than total amount');
      }

      change = amountPaid - total;
    }

    await this.prisma.payment.create({
      data: {
        order: { connect: { id: dto.orderId } },
        paymentMethod: dto.paymentMethod,
        amount: amountPaid,
        transactionId: dto.transactionId,
        status: PaymentStatus.PAID,
        change,
      },
    });

    await this.prisma.order.update({
      where: { id: dto.orderId },
      data: { status: 'PAID' },
    });

    await this.updateProductStockFromOrder(dto.orderId);

    return {
      message: 'Payment successful',
      orderId: dto.orderId,
      paymentMethod: dto.paymentMethod,
      amount: amountPaid,
      change,
      status: 'PAID',
    };
  }

  private async updateProductStockFromOrder(orderId: number) {
    const orderItems = await this.prisma.orderItem.findMany({
      where: { orderId },
      include: { product: true },
    });

    for (const item of orderItems) {
      const newStock = item.product.stock - item.quantity;

      if (newStock < 0) {
        throw new BadRequestException(`Stok untuk produk "${item.product.name}" tidak cukup.`);
      }

      await this.prisma.product.update({
        where: { id: item.productId },
        data: { stock: newStock },
      });
    }
  }

  async findAll() {
    return this.prisma.payment.findMany({
      include: { order: true },
    });
  }
}
