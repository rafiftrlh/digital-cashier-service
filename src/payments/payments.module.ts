import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { OrdersService } from '../orders/orders.service';
import { OrderItemsService } from '../orders/order-items.service';
import { DiscountsService } from '../discounts/discounts.service';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, OrdersService, OrderItemsService, DiscountsService],
  exports: [PaymentsService]
})
export class PaymentsModule { }