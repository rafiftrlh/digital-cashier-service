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
import { OrderStatus, OrderType, Role } from '@prisma/client';
import { OrdersService } from './orders.service';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { SessionAuthGuard } from 'src/auth/guards/session-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('orders')
@UseGuards(SessionAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @Roles(Role.ADMIN, Role.CASHIER)
  async findAll(@Query('status') status?: string) {
    if (status) {
      try {
        const orderStatus = status as OrderStatus;
        return this.ordersService.findByStatus(orderStatus);
      } catch (error) {
        throw new BadRequestException(`Invalid order status: ${status}`);
      }
    }
    return this.ordersService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.CASHIER)
  async findOne(@Param('id') id: string) {
    const order = await this.ordersService.findOne(parseInt(id));

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  @Post()
  async create(@Body() data: any) {
    // Sanitize and validate input data
    const orderData = {
      customerName: data.customerName,
      tableNumber: data.tableNumber,
      orderType: (data.orderType as OrderType) || OrderType.DINE_IN,
      cashierId:
        typeof data.cashierId === 'string'
          ? parseInt(data.cashierId)
          : data.cashierId,
      items: Array.isArray(data.items)
        ? data.items.map((item) => ({
            productId:
              typeof item.productId === 'string'
                ? parseInt(item.productId)
                : item.productId,
            quantity:
              typeof item.quantity === 'string'
                ? parseInt(item.quantity)
                : item.quantity,
            notes: item.notes,
          }))
        : [],
    };

    if (!orderData.customerName) {
      throw new BadRequestException('Customer name is required');
    }

    if (!orderData.items || orderData.items.length === 0) {
      throw new BadRequestException('Order must have at least one item');
    }

    return this.ordersService.create(orderData);
  }

  @Put(':id/status')
  @Roles(Role.ADMIN, Role.CASHIER)
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    try {
      const orderId = parseInt(id);
      const orderStatus = status as OrderStatus;

      return await this.ordersService.updateStatus(orderId, orderStatus);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Invalid input: ${error.message || 'Could not update order status'}`,
      );
    }
  }

  @Put(':id/cancel')
  @Roles(Role.ADMIN, Role.CASHIER)
  async cancelOrder(@Param('id') id: string) {
    try {
      const orderId = parseInt(id);
      return await this.ordersService.cancel(orderId);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Invalid input: ${error.message || 'Could not cancel order'}`,
      );
    }
  }
}
