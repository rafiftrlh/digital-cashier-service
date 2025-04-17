import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderItemsService } from './order-items.service';
import { DiscountsService } from '../discounts/discounts.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, OrderItemsService, DiscountsService],
  exports: [OrdersService, OrderItemsService],
})
export class OrdersModule {}
