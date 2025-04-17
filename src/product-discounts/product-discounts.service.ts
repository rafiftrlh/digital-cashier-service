import { Injectable } from '@nestjs/common';
import { Prisma, ProductDiscount } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductDiscountsService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<ProductDiscount[]> {
    return this.prisma.productDiscount.findMany({
      include: {
        product: true,
        discount: true,
      },
    });
  }

  async findByProduct(productId: number): Promise<ProductDiscount[]> {
    return this.prisma.productDiscount.findMany({
      where: {
        productId,
      },
      include: {
        discount: true,
      },
    });
  }

  async findByDiscount(discountId: number): Promise<ProductDiscount[]> {
    return this.prisma.productDiscount.findMany({
      where: {
        discountId,
      },
      include: {
        product: true,
      },
    });
  }

  async create(data: {
    productId: number;
    discountId: number;
  }): Promise<ProductDiscount> {
    return this.prisma.productDiscount.create({
      data: {
        product: {
          connect: { id: data.productId },
        },
        discount: {
          connect: { id: data.discountId },
        },
      },
      include: {
        product: true,
        discount: true,
      },
    });
  }

  async remove(
    productId: number,
    discountId: number,
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
}
