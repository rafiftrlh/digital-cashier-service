import {
     Controller,
     Get,
     Post,
     Put,
     Delete,
     Body,
     Param,
     NotFoundException,
     Query,
} from '@nestjs/common';
import { Prisma, Discount } from '@prisma/client';
import { DiscountsService } from './discounts.service';

@Controller('discounts')
export class DiscountsController {
     constructor(private readonly discountsService: DiscountsService) { }

     @Get()
     async findAll(@Query('active') active?: string): Promise<Discount[]> {
          if (active === 'true') {
               return this.discountsService.findActiveDiscounts();
          }
          return this.discountsService.findAll();
     }

     @Get('calculate')
     async calculateDiscount(
          @Query('productId') productId: string,
          @Query('quantity') quantity: string,
          @Query('unitPrice') unitPrice: string,
     ) {
          if (!productId || !quantity || !unitPrice) {
               throw new NotFoundException('Missing required parameters: productId, quantity, unitPrice');
          }

          return await this.discountsService.calculateDiscount(
               parseInt(productId),
               parseInt(quantity),
               parseFloat(unitPrice),
          );
     }

     @Get(':id')
     async findOne(@Param('id') id: string): Promise<Discount> {
          const discount = await this.discountsService.findOne(parseInt(id));

          if (!discount) {
               throw new NotFoundException(`Discount with ID ${id} not found`);
          }

          return discount;
     }

     @Post()
     async create(@Body() data: Prisma.DiscountCreateInput): Promise<Discount> {
          // Convert string values to proper types if needed
          const discountData = {
               ...data,
               value: typeof data.value === 'string' ? parseFloat(data.value) : data.value,
               buyX: data.buyX && typeof data.buyX === 'string' ? parseInt(data.buyX) : data.buyX,
               getY: data.getY && typeof data.getY === 'string' ? parseInt(data.getY) : data.getY,
          };

          return this.discountsService.create(discountData);
     }

     @Put(':id')
     async update(
          @Param('id') id: string,
          @Body() data: Prisma.DiscountUpdateInput,
     ): Promise<Discount> {
          try {
               // Convert string values to proper types if needed
               const discountData = {
                    ...data,
                    value: data.value && typeof data.value === 'string' ? parseFloat(data.value) : data.value,
                    buyX: data.buyX && typeof data.buyX === 'string' ? parseInt(data.buyX) : data.buyX,
                    getY: data.getY && typeof data.getY === 'string' ? parseInt(data.getY) : data.getY,
               };

               return await this.discountsService.update(parseInt(id), discountData);
          } catch (error) {
               if (error.code === 'P2025') {
                    throw new NotFoundException(`Discount with ID ${id} not found`);
               }
               throw error;
          }
     }

     @Delete(':id')
     async remove(@Param('id') id: string): Promise<Discount> {
          try {
               return await this.discountsService.remove(parseInt(id));
          } catch (error) {
               if (error.code === 'P2025') {
                    throw new NotFoundException(`Discount with ID ${id} not found`);
               }
               throw error;
          }
     }

     @Post(':discountId/products/:productId')
     async applyDiscountToProduct(
          @Param('discountId') discountId: string,
          @Param('productId') productId: string,
     ) {
          try {
               return await this.discountsService.applyDiscountToProduct(
                    parseInt(discountId),
                    parseInt(productId),
               );
          } catch (error) {
               throw new NotFoundException(
                    `Could not apply discount. Check if discount ID ${discountId} and product ID ${productId} exist.`,
               );
          }
     }

     @Delete(':discountId/products/:productId')
     async removeDiscountFromProduct(
          @Param('discountId') discountId: string,
          @Param('productId') productId: string,
     ) {
          try {
               return await this.discountsService.removeDiscountFromProduct(
                    parseInt(discountId),
                    parseInt(productId),
               );
          } catch (error) {
               throw new NotFoundException(
                    `Could not remove discount. Check if discount ID ${discountId} is applied to product ID ${productId}.`,
               );
          }
     }
}