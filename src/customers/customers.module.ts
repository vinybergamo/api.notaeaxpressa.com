import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { CustomersRepository } from './customers.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { CustomersSubscriber } from './customers.subcriber';
import { Charge } from '@/charges/entities/charge.entity';
import { ChargesRepository } from '@/charges/charges.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, Charge])],
  controllers: [CustomersController],
  providers: [
    CustomersService,
    CustomersRepository,
    CustomersSubscriber,
    ChargesRepository,
  ],
  exports: [CustomersService, CustomersRepository],
})
export class CustomersModule {}
