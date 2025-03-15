import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
     catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
          const ctx = host.switchToHttp();
          const response = ctx.getResponse<Response>();

          let status = HttpStatus.INTERNAL_SERVER_ERROR;
          let message = 'Internal server error';

          switch (exception.code) {
               case 'P2002': // Unique constraint violation
                    status = HttpStatus.CONFLICT;
                    message = 'Data already exists';
                    break;
               case 'P2025': // Record not found
                    status = HttpStatus.NOT_FOUND;
                    message = 'Record not found';
                    break;
          }

          response.status(status).json({
               statusCode: status,
               message,
               error: exception.code,
          });
     }
}