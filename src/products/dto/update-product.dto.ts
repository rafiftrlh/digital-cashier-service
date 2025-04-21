import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateProductDto {
     @IsOptional()
     @IsString()
     name?: string;

     @IsOptional()
     @Type(() => Number)
     @IsNumber()
     price?: number;

     @IsOptional()
     @Type(() => Number)
     @IsNumber()
     stock?: number;

     @IsOptional()
     @Type(() => Number)
     @IsNumber()
     categoryId?: number;

     @IsOptional()
     @IsBoolean()
     isActive?: boolean;
}
