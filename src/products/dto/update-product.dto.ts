import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateProductDto {
     @IsOptional()
     @IsString()
     name?: string;

     @IsOptional()
     @IsNumber()
     price?: number;

     @IsOptional()
     @IsNumber()
     stock?: number;

     @IsOptional()
     @IsNumber()
     categoryId?: number;

     @IsOptional()
     @IsBoolean()
     isActive?: boolean;
}
