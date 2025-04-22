import { IsDateString, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { DiscountType } from '@prisma/client';
import { Type } from 'class-transformer';

export class UpdateDiscountDto {
     @IsOptional()
     name?: string;

     @IsOptional()
     @IsEnum(DiscountType)
     type?: DiscountType;

     @IsOptional()
     @Type(() => Number)
     @IsNumber()
     value?: number;

     @IsOptional()
     @Type(() => Number)
     @IsNumber()
     freeProduct?: number;

     @IsOptional()
     @IsDateString()
     startDate?: string;

     @IsOptional()
     @IsDateString()
     endDate?: string;
}
