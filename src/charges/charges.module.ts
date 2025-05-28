import { Module } from '@nestjs/common';
import { ChargesService } from './charges.service';
import { ChargesController } from './charges.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Charge } from './entities/charge.entity';
import { ChargesRepository } from './charges.repository';
import { OpenPixModule } from 'openpix-nestjs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OpenPixGatewayService } from './openpix-gateway.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Charge]),
    OpenPixModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const appId = configService.get('OPENPIX_APP_ID');
        const sandbox = configService.get<boolean>('OPENPIX_SANDBOX', false);
        return {
          appId,
          sandbox,
        };
      },
    }),
  ],
  controllers: [ChargesController],
  providers: [ChargesService, ChargesRepository, OpenPixGatewayService],
  exports: [ChargesService, ChargesRepository],
})
export class ChargesModule {}
