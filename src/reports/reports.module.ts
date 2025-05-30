import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Charge } from '@/charges/entities/charge.entity';
import { ChargesRepository } from '@/charges/charges.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Charge])],
  controllers: [ReportsController],
  providers: [ReportsService, ChargesRepository],
  exports: [ReportsService],
})
export class ReportsModule {}
