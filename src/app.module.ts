import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { ProductCategoriesModule } from './product-categories/product-categories.module';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    ProductCategoriesModule,
    ProductsModule,
  ],
  controllers: [AppController],
  providers: [AppService, AuthService],
})
export class AppModule { }
