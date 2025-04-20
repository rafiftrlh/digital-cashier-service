import { IsOptional, IsString } from 'class-validator';

export class UpdateProductCategoryDto {
     @IsString()
     @IsOptional()
     name?: string;
}
