import {
  Controller, Post, Body, Get, Param, Patch, Delete,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { DiscountsService } from './discounts.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { ApplyDiscountDto } from './dto/apply-discount.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { SessionAuthGuard } from 'src/auth/guards/session-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@Controller('discounts')
@UseGuards(SessionAuthGuard, RolesGuard)
export class DiscountController {
  constructor(private readonly discountsService: DiscountsService) { }

  @Post()
  @Roles(Role.ADMIN)
  @UseInterceptors(AnyFilesInterceptor())
  create(@Body() dto: CreateDiscountDto) {
    return this.discountsService.create(dto);
  }

  @Get()
  findAll() {
    return this.discountsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.discountsService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @UseInterceptors(AnyFilesInterceptor())
  update(@Param('id') id: string, @Body() dto: UpdateDiscountDto) {
    return this.discountsService.update(+id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.discountsService.remove(+id);
  }

  @Post('apply')
  @Roles(Role.ADMIN)
  applyDiscount(@Body() dto: ApplyDiscountDto) {
    return this.discountsService.applyToProduct(dto);
  }
}
