import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
     @IsString()
     @IsNotEmpty()
     name: string;

     @Type(() => Number)
     @IsNumber()
     price: number;

     @Type(() => Number)
     @IsNumber()
     stock: number;

     @IsOptional()
     @Type(() => Number)
     @IsNumber()
     categoryId?: number;
}
