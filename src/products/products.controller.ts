import {
     Controller,
     Get,
     Post,
     Put,
     Delete,
     Body,
     Param,
     NotFoundException,
     UseGuards,
} from '@nestjs/common';
import { Prisma, Product, Role } from '@prisma/client';
import { ProductsService } from './products.service';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { SessionAuthGuard } from 'src/auth/guards/session-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('products')
@UseGuards(SessionAuthGuard, RolesGuard)
export class ProductsController {
     constructor(private readonly productsService: ProductsService) { }

     @Get()
     async findAll(): Promise<Product[]> {
          return this.productsService.findAll();
     }

     @Get(':id')
     async findOne(@Param('id') id: string): Promise<Product> {
          const product = await this.productsService.findOne(parseInt(id));

          if (!product) {
               throw new NotFoundException(`Product with ID ${id} not found`);
          }

          return product;
     }

     @Roles(Role.ADMIN)
     @Post()
     async create(@Body() data: any): Promise<Product> {
          const productData: Prisma.ProductCreateInput = {
               ...data,
               price: typeof data.price === 'string' ? parseFloat(data.price) : data.price,
               stock: typeof data.stock === 'string' ? parseInt(data.stock) : data.stock,
               categoryId: data.categoryId ?
                    (typeof data.categoryId === 'string' ? parseInt(data.categoryId) : data.categoryId) :
                    undefined,
          };

          return this.productsService.create(productData);
     }

     @Roles(Role.ADMIN)
     @Put(':id')
     async update(
          @Param('id') id: string,
          @Body() data: any,
     ): Promise<Product> {
          try {
               const productData: Prisma.ProductUpdateInput = {
                    ...data,
                    price: data.price !== undefined ?
                         (typeof data.price === 'string' ? parseFloat(data.price) : data.price) :
                         undefined,
                    stock: data.stock !== undefined ?
                         (typeof data.stock === 'string' ? parseInt(data.stock) : data.stock) :
                         undefined,
                    categoryId: data.categoryId !== undefined ?
                         (typeof data.categoryId === 'string' ? parseInt(data.categoryId) : data.categoryId) :
                         undefined,
               };

               return await this.productsService.update(parseInt(id), productData);
          } catch (error) {
               if (error.code === 'P2025') {
                    throw new NotFoundException(`Product with ID ${id} not found`);
               }
               throw error;
          }
     }

     @Roles(Role.ADMIN)
     @Delete(':id')
     async remove(@Param('id') id: string): Promise<Product> {
          try {
               return await this.productsService.remove(parseInt(id));
          } catch (error) {
               if (error.code === 'P2025') {
                    throw new NotFoundException(`Product with ID ${id} not found`);
               }
               throw error;
          }
     }

     @Roles(Role.ADMIN)
     @Put(':id/restore')
     async restore(@Param('id') id: string): Promise<Product> {
          try {
               return await this.productsService.restore(parseInt(id));
          } catch (error) {
               if (error.code === 'P2025') {
                    throw new NotFoundException(`Product with ID ${id} not found`);
               }
               throw error;
          }
     }
}