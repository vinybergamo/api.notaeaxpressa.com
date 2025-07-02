import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { milliseconds } from 'date-fns';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity';
import { InvoicesRepository } from './invoices.repository';
import { Company } from '@/companies/entities/company.entity';
import { CompaniesRepository } from '@/companies/companies.repository';
import { Charge } from '@/charges/entities/charge.entity';
import { ChargesRepository } from '@/charges/charges.repository';
import { CustomersRepository } from '@/customers/customers.repository';
import { Customer } from '@/customers/entities/customer.entity';
import { BullModule } from '@nestjs/bullmq';
import { InvoicesProcessor } from './invoices.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, Company, Charge, Customer]),
    BullModule.registerQueue({
      name: 'invoices',
    }),
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        baseURL:
          configService.get<string>('INVOICE_API_URL') ||
          'http://localhost:8080',
        auth: {
          username: configService.get<string>('INVOICE_API_TOKEN') || 'user',
          password: '',
        },
        timeout: milliseconds({
          seconds: 10,
        }),
      }),
    }),
  ],
  controllers: [InvoicesController],
  providers: [
    InvoicesService,
    InvoicesRepository,
    InvoicesProcessor,
    CompaniesRepository,
    ChargesRepository,
    CustomersRepository,
  ],
})
export class InvoicesModule {}
