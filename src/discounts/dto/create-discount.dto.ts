import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { DiscountType } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateDiscountDto {
     @IsNotEmpty()
     name: string;

     @IsEnum(DiscountType)
     type: DiscountType;

     @IsOptional()
     @Type(() => Number)
     @IsNumber()
     value?: number;

     @IsOptional()
     @Type(() => Number)
     @IsNumber()
     freeProduct?: number;

     @IsDateString()
     startDate: string;

     @IsDateString()
     endDate: string;
}
