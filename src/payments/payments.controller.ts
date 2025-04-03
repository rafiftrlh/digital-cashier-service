import {
     Controller,
     Get,
     Post,
     Put,
     Body,
     Param,
     NotFoundException,
     BadRequestException,
     UseGuards,
     Query,
} from '@nestjs/common';
import { PaymentMethod, PaymentStatus, Role } from '@prisma/client';
import { PaymentsService } from './payments.service';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { SessionAuthGuard } from 'src/auth/guards/session-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('payments')
@UseGuards(SessionAuthGuard, RolesGuard)
export class PaymentsController {
     constructor(private readonly paymentsService: PaymentsService) { }

     @Get()
     @Roles(Role.ADMIN, Role.CASHIER)
     async findAll() {
          return this.paymentsService.findAll();
     }

     @Get('order/:orderId')
     async findByOrder(@Param('orderId') orderId: string) {
          return this.paymentsService.findByOrder(parseInt(orderId));
     }

     @Get(':id')
     async findOne(@Param('id') id: string) {
          const payment = await this.paymentsService.findOne(parseInt(id));

          if (!payment) {
               throw new NotFoundException(`Payment with ID ${id} not found`);
          }

          return payment;
     }

     @Post()
     @Roles(Role.ADMIN, Role.CASHIER)
     async create(@Body() data: any) {
          try {
               const paymentData = {
                    orderId: typeof data.orderId === 'string' ? parseInt(data.orderId) : data.orderId,
                    paymentMethod: data.paymentMethod as PaymentMethod,
                    amount: typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount,
                    transactionId: data.transactionId,
               };

               return await this.paymentsService.create(paymentData);
          } catch (error) {
               if (error instanceof NotFoundException || error instanceof BadRequestException) {
                    throw error;
               }
               throw new BadRequestException(`Invalid input: ${error.message}`);
          }
     }

     @Put(':id/process')
     @Roles(Role.ADMIN, Role.CASHIER)
     async processPayment(
          @Param('id') id: string,
          @Body('status') status: string,
     ) {
          try {
               const paymentId = parseInt(id);
               const paymentStatus = status as PaymentStatus;

               return await this.paymentsService.processPayment(paymentId, paymentStatus);
          } catch (error) {
               if (error instanceof NotFoundException || error instanceof BadRequestException) {
                    throw error;
               }
               throw new BadRequestException(`Invalid input: ${error.message}`);
          }
     }
}