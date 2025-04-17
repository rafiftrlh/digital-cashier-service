import { OrderType } from '@prisma/client';

export class OrderItemDto {
  productId: number;
  quantity: number;
  notes?: string;
}

export class CreateOrderDto {
  customerName: string;
  tableNumber?: string;
  orderType: OrderType;
  items: OrderItemDto[];
  cashierId: number;
}
