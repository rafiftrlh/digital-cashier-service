import { Injectable } from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        category: true,
      },
    });
  }

  async findDeleted(): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: {
        deletedAt: {
          not: null,
        },
      },
      include: {
        category: true,
      },
    });
  }

  async findOne(id: number): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
  }

  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    return this.prisma.product.create({
      data,
      include: {
        category: true,
      },
    });
  }

  async update(id: number, data: Prisma.ProductUpdateInput): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });
  }

  async remove(id: number): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
      include: {
        category: true,
      },
    });
  }

  async restore(id: number): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data: {
        isActive: true,
        deletedAt: null,
      },
      include: {
        category: true,
      },
    });
  }
}
