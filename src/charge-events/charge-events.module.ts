import { Module } from '@nestjs/common';
import { ChargeEventsService } from './charge-events.service';
import { ChargeEventsController } from './charge-events.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChargeEvents } from './entities/charge-events.entity';
import { ChargeEventsRepository } from './charge-events.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ChargeEvents])],
  controllers: [ChargeEventsController],
  providers: [ChargeEventsService, ChargeEventsRepository],
  exports: [ChargeEventsService, ChargeEventsRepository],
})
export class ChargeEventsModule {}
