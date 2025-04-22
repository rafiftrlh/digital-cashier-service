import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { ApplyDiscountDto } from './dto/apply-discount.dto';

@Injectable()
export class DiscountsService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateDiscountDto) {
    if (dto.type === 'BUY_X_GET_Y' && !dto.freeProduct) {
      throw new BadRequestException('freeProduct required for BUY_X_GET_Y type');
    }

    return this.prisma.discount.create({
      data: {
        ...dto,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
      },
    });
  }

  async findAll() {
    return this.prisma.discount.findMany();
  }

  async findOne(id: number) {
    return this.prisma.discount.findUnique({ where: { id } });
  }

  async update(id: number, dto: UpdateDiscountDto) {
    return this.prisma.discount.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.discount.delete({ where: { id } });
  }

  async applyToProduct(dto: ApplyDiscountDto) {
    const { productIds, discountId } = dto;

    for (const productId of productIds) {
      const existing = await this.prisma.productDiscount.findFirst({
        where: {
          productId,
          discount: {
            isActive: true,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
          },
        },
      });

      if (existing) continue;

      await this.prisma.productDiscount.create({
        data: {
          productId,
          discountId,
        },
      });
    }

    return { message: 'Discount applied successfully to selected products.' };
  }

}
