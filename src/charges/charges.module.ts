import { Logger, Module } from '@nestjs/common';
import { ChargesService } from './charges.service';
import { ChargesController } from './charges.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Charge } from './entities/charge.entity';
import { ChargesRepository } from './charges.repository';
import { OpenPixModule } from 'openpix-nestjs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OpenPixGatewayService } from './openpix-gateway.service';
import { ChargesListener } from './charges.listerner';
import { Customer } from '@/customers/entities/customer.entity';
import { CustomersRepository } from '@/customers/customers.repository';
import { ManualGatewayService } from './manual-gateway.service';
import { ChargesSubscriber } from './charges.subcriber';
import { ChargeRefunds } from './entities/charge-refunds';
import { ChargeRefundsRepository } from './charge-refunds.repository';
import { Company } from '@/companies/entities/company.entity';
import { CompaniesRepository } from '@/companies/companies.repository';
import { Gateway } from './entities/gateway.entity';
import { GatewaysRepository } from './gateways.repository';
import { GatewaysService } from './gateways.service';
import { GatewaysController } from './gateways.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Charge,
      Customer,
      ChargeRefunds,
      Company,
      Gateway,
    ]),
    OpenPixModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('OpenPixModule');
        const appId = configService.get('OPENPIX_APP_ID');
        const sandbox =
          configService.get<string>('OPENPIX_SANDBOX', 'false') === 'true';

        if (sandbox) {
          logger.warn(
            'OpenPix is running in sandbox mode. Use with caution in production environments.',
          );
        }
        return {
          appId,
          sandbox,
        };
      },
    }),
  ],
  controllers: [ChargesController, GatewaysController],
  providers: [
    ChargesService,
    ChargesRepository,
    OpenPixGatewayService,
    ManualGatewayService,
    ChargesListener,
    CustomersRepository,
    ChargesSubscriber,
    ChargeRefundsRepository,
    CompaniesRepository,
    GatewaysRepository,
    GatewaysService,
  ],
  exports: [ChargesService, ChargesRepository],
})
export class ChargesModule {}
