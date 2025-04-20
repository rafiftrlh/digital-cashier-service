import {
  Controller, Get, Post, Put, Delete, Body, Param,
  NotFoundException, UploadedFile, UseInterceptors,
  UseGuards
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProductsService } from './products.service';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';
import * as fs from 'fs';
import * as path from 'path';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SessionAuthGuard } from 'src/auth/guards/session-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('products')
@UseGuards(SessionAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly service: ProductsService) { }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('/deleted')
  @Roles(Role.ADMIN)
  findDeleted() {
    return this.service.findDeleted();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.CASHIER)
  async findOne(@Param('id') id: string) {
    const product = await this.service.findOne(+id);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  @Post()
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/products',
      filename: (_, file, cb) => {
        const unique = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
        cb(null, `${file.fieldname}-${unique}${extname(file.originalname)}`);
      }
    }),
    fileFilter: (_, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
    }
  }))
  async create(
    @Body() data: CreateProductDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.service.create({
      ...data,
      image: file ? `/uploads/products/${file.filename}` : undefined
    });
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/products',
      filename: (_, file, cb) => {
        const unique = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
        cb(null, `${file.fieldname}-${unique}${extname(file.originalname)}`);
      }
    }),
    fileFilter: (_, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
    }
  }))
  async update(
    @Param('id') id: string,
    @Body() data: UpdateProductDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    const product = await this.service.findOne(+id);
    if (!product) throw new NotFoundException('Product not found');

    // delete old image if exists
    if (file && product.image) {
      const oldPath = path.join(process.cwd(), product.image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    return this.service.update(+id, {
      ...data,
      image: file ? `/uploads/products/${file.filename}` : product.image
    });
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }

  @Put(':id/restore')
  @Roles(Role.ADMIN)
  async restore(@Param('id') id: string) {
    return this.service.restore(+id);
  }
}
