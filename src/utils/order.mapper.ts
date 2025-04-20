import { Order } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export function mapOrderToResponse(order: any) {
     return {
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          tableNumber: order.tableNumber,
          orderType: order.orderType,
          status: order.status,
          createdAt: order.createdAt,
          cashierId: order.cashierId,

          items: order.orderItems.map((item: any) => ({
               productName: item.product.name,
               quantity: item.quantity,
               unitPrice: (item.unitPrice as Decimal).toNumber(),
               discountAmount: (item.discountAmount as Decimal).toNumber(),
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
          totalAmount: (order.totalAmount as Decimal).toNumber(),
     };
}
