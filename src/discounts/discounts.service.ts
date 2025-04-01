import { Injectable } from '@nestjs/common';
import { Prisma, Discount, ProductDiscount } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DiscountsService {
     constructor(private prisma: PrismaService) { }

     async findAll(): Promise<Discount[]> {
          return this.prisma.discount.findMany({
               where: {
                    isActive: true,
                    deletedAt: null,
               },
               include: {
                    productDiscounts: {
                         include: {
                              product: true,
                         },
                    },
               },
          });
     }

     async findOne(id: number): Promise<Discount | null> {
          return this.prisma.discount.findUnique({
               where: { id },
               include: {
                    productDiscounts: {
                         include: {
                              product: true,
                         },
                    },
               },
          });
     }

     async findActiveDiscounts(): Promise<Discount[]> {
          const currentDate = new Date();

          return this.prisma.discount.findMany({
               where: {
                    isActive: true,
                    deletedAt: null,
                    startDate: {
                         lte: currentDate,
                    },
                    endDate: {
                         gte: currentDate,
                    },
               },
               include: {
                    productDiscounts: {
                         include: {
                              product: true,
                         },
                    },
               },
          });
     }

     async create(data: Prisma.DiscountCreateInput): Promise<Discount> {
          return this.prisma.discount.create({
               data,
               include: {
                    productDiscounts: true,
               },
          });
     }

     async update(id: number, data: Prisma.DiscountUpdateInput): Promise<Discount> {
          return this.prisma.discount.update({
               where: { id },
               data,
               include: {
                    productDiscounts: true,
               },
          });
     }

     async remove(id: number): Promise<Discount> {
          // Soft delete
          return this.prisma.discount.update({
               where: { id },
               data: {
                    isActive: false,
                    deletedAt: new Date(),
               },
          });
     }

     async applyDiscountToProduct(
          discountId: number,
          productId: number
     ): Promise<ProductDiscount> {
          const productDiscount = await this.prisma.productDiscount.create({
               data: {
                    product: {
                         connect: { id: productId },
                    },
                    discount: {
                         connect: { id: discountId },
                    },
               },
          });

          return productDiscount;
     }

     async removeDiscountFromProduct(
          discountId: number,
          productId: number
     ): Promise<ProductDiscount> {
          return this.prisma.productDiscount.delete({
               where: {
                    productId_discountId: {
                         productId,
                         discountId,
                    },
               },
          });
     }


     async calculateDiscount(
          productId: number,
          quantity: number,
          unitPrice: number
     ): Promise<{ discountAmount: number; discountId: number | null }> {
          // Get all active discounts for this product
          const currentDate = new Date();

          const productDiscounts = await this.prisma.productDiscount.findMany({
               where: {
                    productId,
                    discount: {
                         isActive: true,
                         deletedAt: null,
                         startDate: {
                              lte: currentDate,
                         },
                         endDate: {
                              gte: currentDate,
                         },
                    },
               },
               include: {
                    discount: true,
               },
          });

          if (!productDiscounts.length) {
               return { discountAmount: 0, discountId: null };
          }

          let maxDiscount = 0;
          let bestDiscountId: number | null = null;

          // Evaluate each applicable discount and find the best one
          for (const productDiscount of productDiscounts) {
               const { discount } = productDiscount;
               let currentDiscount = 0;

               switch (discount.type) {
                    case 'PERCENTAGE':
                         currentDiscount = (unitPrice * quantity * Number(discount.value)) / 100;
                         break;
                    case 'FIXED':
                         currentDiscount = Number(discount.value) * quantity;
                         break;
                    case 'BUY_X_GET_Y':
                         if (discount.buyX && discount.getY) {
                              const sets = Math.floor(quantity / (discount.buyX + discount.getY));
                              const freeItems = sets * discount.getY;
                              currentDiscount = freeItems * unitPrice;
                         }
                         break;
               }

               // Keep the best discount
               if (currentDiscount > maxDiscount) {
                    maxDiscount = currentDiscount;
                    bestDiscountId = discount.id;
               }
          }

          return {
               discountAmount: maxDiscount,
               discountId: bestDiscountId ?? null,
          };
     }
}