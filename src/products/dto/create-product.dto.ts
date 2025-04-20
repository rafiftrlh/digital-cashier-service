import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
     @IsString()
     @IsNotEmpty()
     name: string;

     @IsNumber()
     price: number;

     @IsNumber()
     stock: number;

     @IsOptional()
     @IsNumber()
     categoryId?: number;
}
