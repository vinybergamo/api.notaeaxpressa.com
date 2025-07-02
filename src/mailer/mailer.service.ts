import { Invoice } from '@/invoices/entities/invoice.entity';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';
import { format } from 'date-fns';

@Injectable()
export class MailerService {
  constructor(private readonly nestMailerService: NestMailerService) {}

  @OnEvent('invoices.authorized')
  handleInvoiceAuthorizedEvent(data: Invoice) {
    if (!data.customer) {
      return;
    }

    this.nestMailerService.sendMail({
      to: data.customer.email,
      from: `"Financeiro" <financeiro@vinybergamo.com>`,
      subject: 'Nota Fiscal Eletrônica Autorizada',
      template: 'invoice-authorized',
      context: {
        ...data,
        issueDate: format(new Date(data.issueDate), 'dd/MM/yyyy HH:mm:ss'),
        amount: new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(data.amount / 100),
      },
    });
  }
}
