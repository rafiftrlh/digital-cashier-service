import { IsInt } from 'class-validator';

export class ApplyDiscountDto {
     @IsInt()
     productId: number;

     @IsInt()
     discountId: number;
}
