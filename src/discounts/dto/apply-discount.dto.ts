import { Type } from 'class-transformer';
import { IsArray, IsInt } from 'class-validator';

export class ApplyDiscountDto {
     @IsArray()
     @IsInt({ each: true })
     productIds: number[];

     @IsInt()
     discountId: number;
}
