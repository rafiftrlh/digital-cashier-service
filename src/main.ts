import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { PrismaExceptionFilter } from './prisma/prisma-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { GlobalExceptionFilter } from './common/filters/exception.filter';
import * as dotenv from 'dotenv';
import * as session from 'express-session';
import * as express from 'express';
import { resolve } from 'path';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use('/uploads', express.static(resolve('uploads')));

  app.use(
    session({
      secret: process.env.SESSION_SECRET ?? 'secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false, httpOnly: true, maxAge: 1000 * 60 * 60
      }
    })
  )

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true
  }));

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalFilters(new PrismaExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
