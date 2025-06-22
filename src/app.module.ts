import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import { milliseconds } from 'date-fns';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CustomersModule } from './customers/customers.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ChargesModule } from './charges/charges.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { ProjectsModule } from './projects/projects.module';
import { PlansModule } from './plans/plans.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ReportsModule } from './reports/reports.module';
import { ApplicationsModule } from './applications/applications.module';
import { InvoicesModule } from './invoices/invoices.module';
import { CompaniesModule } from './companies/companies.module';
import { ChargeEventsModule } from './charge-events/charge-events.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        '.env',
        '.env.development',
        '.env.production',
        '.env.test',
        '.env.local',
      ],
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: milliseconds({ seconds: 30 }),
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: milliseconds({ seconds: 60 }),
          limit: 100,
        },
      ],
    }),
    EventEmitterModule.forRoot({
      global: true,
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    UsersModule,
    AuthModule,
    CustomersModule,
    ChargesModule,
    WebhooksModule,
    ProjectsModule,
    PlansModule,
    SubscriptionsModule,
    ReportsModule,
    ApplicationsModule,
    InvoicesModule,
    CompaniesModule,
    ChargeEventsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
