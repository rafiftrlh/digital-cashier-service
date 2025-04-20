import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ProductCategoriesService } from './product-categories.service';
import { ProductCategory } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';
import { SessionAuthGuard } from 'src/auth/guards/session-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('product-categories')
@UseGuards(SessionAuthGuard, RolesGuard)
export class ProductCategoriesController {
  constructor(private readonly service: ProductCategoriesService) { }

  @Get()
  @Roles(Role.ADMIN, Role.CASHIER)
  async findAll(): Promise<ProductCategory[]> {
    const categories = await this.service.findAll();
    if (!categories || categories.length === 0) {
      throw new NotFoundException('No product categories found');
    }
    return categories;
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.CASHIER)
  async findOne(@Param('id') id: string): Promise<ProductCategory> {
    const category = await this.service.findOne(+id);
    if (!category) {
      throw new NotFoundException('Product category not found');
    }
    return category;
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateProductCategoryDto): Promise<ProductCategory> {
    return this.service.create(dto);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductCategoryDto,
  ): Promise<ProductCategory> {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string): Promise<ProductCategory> {
    return this.service.remove(+id);
  }
}
