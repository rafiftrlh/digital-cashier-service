import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put } from '@nestjs/common';
import { ProductCategoriesService } from './product-categories.service';
import { Prisma, ProductCategory } from '@prisma/client';

@Controller('product-categories')
export class ProductCategoriesController {
     constructor(private readonly productCategoriesService: ProductCategoriesService) { }

     @Get()
     async findAll(): Promise<ProductCategory[]> {
          const data = this.productCategoriesService.findAll();

          if (!data) {
               throw new NotFoundException('Product categories not found');
          }

          return data;
     }

     @Get(':id')
     async findOne(@Param('id') id: string): Promise<ProductCategory | null> {
          const data = await this.productCategoriesService.findOne(+id);

          if (!data) {
               throw new NotFoundException('Product category not found');
          }

          return data;
     }

     @Post()
     create(@Body() data: Prisma.ProductCategoryCreateInput): Promise<ProductCategory> {
          return this.productCategoriesService.create(data);
     }

     @Put(':id')
     update(@Param('id') id: string, @Body() data: Prisma.ProductCategoryUpdateInput): Promise<ProductCategory> {
          return this.productCategoriesService.update(+id, data);
     }

     @Delete(':id')
     remove(@Param('id') id: string): Promise<ProductCategory> {
          return this.productCategoriesService.remove(+id);
     }
}
