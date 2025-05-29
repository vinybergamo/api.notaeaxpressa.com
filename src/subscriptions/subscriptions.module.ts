import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Charge } from '@/charges/entities/charge.entity';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionsRepository } from './subscriptions.repository';
import { ChargesRepository } from '@/charges/charges.repository';
import { Customer } from '@/customers/entities/customer.entity';
import { Plan } from '@/plans/entities/plan.entity';
import { CustomersRepository } from '@/customers/customers.repository';
import { PlansRepository } from '@/plans/plans.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription, Charge, Customer, Plan])],
  controllers: [SubscriptionsController],
  providers: [
    SubscriptionsService,
    SubscriptionsRepository,
    ChargesRepository,
    CustomersRepository,
    PlansRepository,
  ],
  exports: [SubscriptionsService, SubscriptionsRepository],
})
export class SubscriptionsModule {}
