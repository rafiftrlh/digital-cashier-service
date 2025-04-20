import { IsDateString, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { DiscountType } from '@prisma/client';

export class UpdateDiscountDto {
     @IsOptional()
     name?: string;

     @IsOptional()
     @IsEnum(DiscountType)
     type?: DiscountType;

     @IsOptional()
     @IsNumber()
     value?: number;

     @IsOptional()
     @IsNumber()
     freeProduct?: number;

     @IsOptional()
     @IsDateString()
     startDate?: string;

     @IsOptional()
     @IsDateString()
     endDate?: string;
}
