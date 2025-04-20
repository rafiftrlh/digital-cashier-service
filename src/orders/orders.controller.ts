import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { SessionAuthGuard } from 'src/auth/guards/session-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('orders')
@UseGuards(SessionAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly service: OrdersService) { }

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.CASHIER)
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: 'PAID' | 'COMPLETED' | 'CANCELLED' },
  ) {
    return this.service.updateStatus(+id, body.status);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  delete(@Param('id') id: string) {
    return this.service.delete(+id);
  }
}
