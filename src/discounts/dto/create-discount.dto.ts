import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { DiscountType } from '@prisma/client';

export class CreateDiscountDto {
     @IsNotEmpty()
     name: string;

     @IsEnum(DiscountType)
     type: DiscountType;

     @IsOptional()
     @IsNumber()
     value?: number;

     @IsOptional()
     @IsNumber()
     freeProduct?: number;

     @IsDateString()
     startDate: string;

     @IsDateString()
     endDate: string;
}
