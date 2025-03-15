import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductCategoriesService {
     constructor(private prisma: PrismaService) { }

     async findAll() {
          return this.prisma.productCategory.findMany();
     }

     async findOne(id: number) {
          return this.prisma.productCategory.findUnique({
               where: { id },
          });
     }

     async create(data: Prisma.ProductCategoryCreateInput) {
          return this.prisma.productCategory.create({
               data,
          });
     }

     async update(id: number, data: Prisma.ProductCategoryUpdateInput) {
          return this.prisma.productCategory.update({
               where: { id },
               data,
          });
     }

     async remove(id: number) {
          return this.prisma.productCategory.delete({
               where: { id },
          });
     }
}
