import { Injectable } from '@nestjs/common';
import { Prisma, ProductCategory } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductCategoriesService {
     constructor(private prisma: PrismaService) { }

     async findAll(): Promise<ProductCategory[]> {
          return this.prisma.productCategory.findMany();
     }

     async findOne(id: number): Promise<ProductCategory | null> {
          return this.prisma.productCategory.findUnique({
               where: { id },
          });
     }

     async create(data: Prisma.ProductCategoryCreateInput): Promise<ProductCategory> {
          return this.prisma.productCategory.create({
               data,
          });
     }

     async update(id: number, data: Prisma.ProductCategoryUpdateInput): Promise<ProductCategory> {
          return this.prisma.productCategory.update({
               where: { id },
               data,
          });
     }

     async remove(id: number): Promise<ProductCategory> {
          return this.prisma.productCategory.delete({
               where: { id },
          });
     }
}
