import {
     Controller,
     Get,
     Post,
     Put,
     Delete,
     Body,
     Param,
     NotFoundException,
     UseGuards,
     UploadedFile,
     UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Prisma, Product, Role } from '@prisma/client';
import { ProductsService } from './products.service';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { SessionAuthGuard } from 'src/auth/guards/session-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import * as fs from 'fs';
import * as path from 'path';

@Controller('products')
@UseGuards(SessionAuthGuard, RolesGuard)
export class ProductsController {
     constructor(private readonly productsService: ProductsService) { }

     @Get()
     async findAll(): Promise<Product[]> {
          return this.productsService.findAll();
     }

     @Get(':id')
     async findOne(@Param('id') id: string): Promise<Product> {
          const product = await this.productsService.findOne(parseInt(id));

          if (!product) {
               throw new NotFoundException(`Product with ID ${id} not found`);
          }

          return product;
     }

     @Roles(Role.ADMIN)
     @Post()
     @UseInterceptors(FileInterceptor('image', {
          storage: diskStorage({
               destination: './uploads/products',
               filename: (req, file, callback) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
               },
          }),
          fileFilter: (req, file, callback) => {
               if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
                    return callback(new Error('Only image files are allowed!'), false);
               }
               callback(null, true);
          },
     }))
     async create(
          @Body() data: any,
          @UploadedFile() file: Express.Multer.File,
     ): Promise<Product> {
          const productData: Prisma.ProductCreateInput = {
               ...data,
               image: file ? `/uploads/products/${file.filename}` : undefined,
               price: typeof data.price === 'string' ? parseFloat(data.price) : data.price,
               stock: typeof data.stock === 'string' ? parseInt(data.stock) : data.stock,
               categoryId: data.categoryId ?
                    (typeof data.categoryId === 'string' ? parseInt(data.categoryId) : data.categoryId) :
                    undefined,
          };

          return this.productsService.create(productData);
     }

     @Roles(Role.ADMIN)
     @Put(':id')
     @UseInterceptors(FileInterceptor('image', {
          storage: diskStorage({
               destination: './uploads/products',
               filename: (req, file, callback) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
               },
          }),
          fileFilter: (req, file, callback) => {
               if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
                    return callback(new Error('Only image files are allowed!'), false);
               }
               callback(null, true);
          },
     }))
     async update(
          @Param('id') id: string,
          @Body() data: any,
          @UploadedFile() file: Express.Multer.File,
     ): Promise<Product> {
          const productId = parseInt(id);

          const existingProduct = await this.productsService.findOne(productId);
          if (!existingProduct) {
               throw new NotFoundException(`Product with ID ${id} not found`);
          }

          if (file && existingProduct.image) {
               const oldImagePath = path.join(__dirname, '..', '..', '..', existingProduct.image);
               if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
               }
          }

          const productData: Prisma.ProductUpdateInput = {
               ...data,
               image: file ? `/uploads/products/${file.filename}` : undefined,
               price: data.price !== undefined ?
                    (typeof data.price === 'string' ? parseFloat(data.price) : data.price) :
                    undefined,
               stock: data.stock !== undefined ?
                    (typeof data.stock === 'string' ? parseInt(data.stock) : data.stock) :
                    undefined,
               categoryId: data.categoryId !== undefined ?
                    (typeof data.categoryId === 'string' ? parseInt(data.categoryId) : data.categoryId) :
                    undefined,
          };

          return await this.productsService.update(productId, productData);
     }

     @Roles(Role.ADMIN)
     @Delete(':id')
     async remove(@Param('id') id: string): Promise<Product> {
          try {
               return await this.productsService.remove(parseInt(id));
          } catch (error) {
               if (error.code === 'P2025') {
                    throw new NotFoundException(`Product with ID ${id} not found`);
               }
               throw error;
          }
     }

     @Roles(Role.ADMIN)
     @Put(':id/restore')
     async restore(@Param('id') id: string): Promise<Product> {
          try {
               return await this.productsService.restore(parseInt(id));
          } catch (error) {
               if (error.code === 'P2025') {
                    throw new NotFoundException(`Product with ID ${id} not found`);
               }
               throw error;
          }
     }

     // @Roles(Role.ADMIN)
     // @Post('upload')
     // @UseInterceptors(FileInterceptor('image', {
     //      storage: diskStorage({
     //           destination: './uploads/products',
     //           filename: (req, file, callback) => {
     //                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
     //                const ext = extname(file.originalname);
     //                callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
     //           },
     //      }),
     //      fileFilter: (req, file, callback) => {
     //           if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
     //                return callback(new Error('Only image files are allowed!'), false);
     //           }
     //           callback(null, true);
     //      },
     // }))
     // async uploadProductImage(@UploadedFile() file: Express.Multer.File) {
     //      return {
     //           message: 'Image uploaded successfully',
     //           filename: file.filename,
     //           path: `/uploads/products/${file.filename}`,
     //      };
     // }
}