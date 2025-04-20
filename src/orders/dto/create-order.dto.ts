import { IsNotEmpty, IsString, IsNumber, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderType } from '@prisma/client';

class OrderItemDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  quantity: number;

  @IsString()
  notes?: string;
}

export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  customerName: string;

  @IsString()
  tableNumber?: string;

  @IsEnum(OrderType)
  orderType: OrderType;

  @IsNumber()
  cashierId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
