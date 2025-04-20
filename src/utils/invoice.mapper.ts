import { Decimal } from '@prisma/client/runtime/library';

export function mapInvoiceFromOrder(order: any) {
     const payment = order.payments[0];

     return {
          orderNumber: order.orderNumber,
          date: order.createdAt,
          customerName: order.customerName,
          paymentMethod: payment?.paymentMethod ?? 'UNKNOWN',
          items: order.orderItems.map((item: any) => ({
               name: item.product.name,
               quantity: item.quantity,
               price: (item.unitPrice as Decimal).toNumber(),
               discount: (item.discountAmount as Decimal).toNumber(),
               subtotal: (item.subtotal as Decimal).toNumber(),
               notes: item.notes,
          })),
          discounts: order.orderDiscounts.map((od: any) => ({
               name: od.discount.name,
               type: od.discount.type,
               saved: (od.amountSaved as Decimal).toNumber(),
          })),
          subtotal: (order.subtotal as Decimal).toNumber(),
          discountAmount: (order.discountAmount as Decimal).toNumber(),
          taxAmount: (order.taxAmount as Decimal).toNumber(),
          total: (order.totalAmount as Decimal).toNumber(),
          paid: payment?.amount?.toNumber() ?? 0,
          change: payment?.change?.toNumber() ?? 0,
     };
}
