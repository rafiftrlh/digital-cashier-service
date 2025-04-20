import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductCategory } from '@prisma/client';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';

@Injectable()
export class ProductCategoriesService {
  constructor(private prisma: PrismaService) { }

  async findAll(): Promise<ProductCategory[]> {
    return this.prisma.productCategory.findMany();
  }

  async findOne(id: number): Promise<ProductCategory | null> {
    return this.prisma.productCategory.findUnique({ where: { id } });
  }

  async create(dto: CreateProductCategoryDto): Promise<ProductCategory> {
    return this.prisma.productCategory.create({ data: dto });
  }

  async update(id: number, dto: UpdateProductCategoryDto): Promise<ProductCategory> {
    const exists = await this.findOne(id);
    if (!exists) throw new NotFoundException('Product category not found');

    return this.prisma.productCategory.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number): Promise<ProductCategory> {
    const exists = await this.findOne(id);
    if (!exists) throw new NotFoundException('Product category not found');

    return this.prisma.productCategory.delete({ where: { id } });
  }
}
