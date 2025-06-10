import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
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
      }),
    }),
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService],
})
export class InvoicesModule {}
