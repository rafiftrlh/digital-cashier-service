import { Module } from '@nestjs/common';
import { DiscountController } from './discounts.controller';
import { DiscountsService } from './discounts.service';

@Module({
  controllers: [DiscountController],
  providers: [DiscountsService],
})
export class DiscountsModule {}
