import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ProductCategoriesService } from './product-categories.service';
import { Prisma } from '@prisma/client';

@Controller('product-categories')
export class ProductCategoriesController {
     constructor(private readonly productCategoriesService: ProductCategoriesService) { }

     @Get()
     findAll() {
          return this.productCategoriesService.findAll();
     }

     @Get(':id')
     findOne(@Param('id') id: string) {
          return this.productCategoriesService.findOne(+id);
     }

     @Post()
     create(@Body() data: Prisma.ProductCategoryCreateInput) {
          return this.productCategoriesService.create(data);
     }

     @Put(':id')
     update(@Param('id') id: string, @Body() data: Prisma.ProductCategoryUpdateInput) {
          return this.productCategoriesService.update(+id, data);
     }

     @Delete(':id')
     remove(@Param('id') id: string) {
          return this.productCategoriesService.remove(+id);
     }
}
