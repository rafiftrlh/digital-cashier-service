import { PaymentMethod } from '@prisma/client';

export class CreatePaymentDto {
     orderId: number;
     paymentMethod: PaymentMethod;
     amount: number;
     transactionId?: string;
}