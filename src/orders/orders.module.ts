import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { DiscountsService } from '../discounts/discounts.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, DiscountsService],
  exports: [OrdersService],
})
export class OrdersModule {}
