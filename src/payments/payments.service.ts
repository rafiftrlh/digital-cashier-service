import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Payment, PaymentMethod, PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
import { OrderStatus } from '@prisma/client';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private ordersService: OrdersService,
  ) {}

  async findAll(): Promise<Payment[]> {
    return this.prisma.payment.findMany({
      include: {
        order: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByOrder(orderId: number): Promise<Payment[]> {
    return this.prisma.payment.findMany({
      where: { orderId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number): Promise<Payment | null> {
    return this.prisma.payment.findUnique({
      where: { id },
      include: {
        order: true,
      },
    });
  }

  async create(data: CreatePaymentDto): Promise<Payment> {
    const { orderId, paymentMethod, amount, transactionId } = data;

    // Verify order exists and is in PENDING status
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payments: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        `Cannot process payment for order in ${order.status} status`,
      );
    }

    // Ensure full payment
    if (amount !== Number(order.totalAmount)) {
      throw new BadRequestException(
        `Payment amount must be equal to the total amount: ${order.totalAmount}`,
      );
    }

    // Create payment transaction
    return this.prisma.$transaction(async (prisma) => {
      // Create the payment
      const payment = await prisma.payment.create({
        data: {
          orderId,
          paymentMethod,
          amount,
          transactionId,
          status: PaymentStatus.PENDING,
        },
      });

      return payment;
    });
  }

  async processPayment(id: number, status: PaymentStatus): Promise<Payment> {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            payments: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException(`Payment is already ${payment.status}`);
    }

    return this.prisma.$transaction(async (prisma) => {
      // Update payment status
      const updatedPayment = await prisma.payment.update({
        where: { id },
        data: { status },
      });

      // If payment is successful, check if order is fully paid
      if (status === PaymentStatus.PAID) {
        const order = payment.order;
        const payments = [
          ...order.payments.filter((p) => p.id !== id),
          { ...payment, status: PaymentStatus.PAID },
        ];

        const totalPaid = payments.reduce(
          (sum, payment) =>
            payment.status === PaymentStatus.PAID
              ? sum + Number(payment.amount)
              : sum,
          0,
        );

        // If order is fully paid, update order status
        if (totalPaid >= Number(order.totalAmount)) {
          await prisma.order.update({
            where: { id: order.id },
            data: { status: OrderStatus.PAID },
          });
        }
      }

      return updatedPayment;
    });
  }
}
