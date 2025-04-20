import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentsService } from './payments.service';
import { SessionAuthGuard } from 'src/auth/guards/session-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('payments')
@UseGuards(SessionAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentService: PaymentsService) { }

  @Post()
  @Roles(Role.ADMIN, Role.CASHIER)
  create(@Body() dto: CreatePaymentDto) {
    return this.paymentService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.CASHIER)
  findAll() {
    return this.paymentService.findAll();
  }
}
