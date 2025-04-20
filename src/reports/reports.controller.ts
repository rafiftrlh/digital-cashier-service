import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { SessionAuthGuard } from 'src/auth/guards/session-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('reports')
@UseGuards(SessionAuthGuard, RolesGuard)
export class ReportsController {
     constructor(private readonly reportService: ReportsService) { }

     @Get('orders')
     @Roles(Role.ADMIN)
     async getOrders(@Query() query: { startDate: string; endDate: string; status?: string }) {
          return this.reportService.getOrderReport(query.startDate, query.endDate, query.status);
     }
}
