import { Controller, Get, Param } from '@nestjs/common';
import { InvoiceService } from './invoice.service';

@Controller('invoice')
export class InvoiceController {
     constructor(private readonly service: InvoiceService) { }

     @Get(':orderId')
     getInvoice(@Param('orderId') orderId: string) {
          return this.service.getInvoice(+orderId);
     }
}
