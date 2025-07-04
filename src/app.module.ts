import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { BullModule } from '@nestjs/bullmq';
import { MailerModule } from './mailer/mailer.module';
import { AppController } from './app.controller';

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
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          url: configService.get<string>(
            'REDIS_URL',
            'redis://localhost:6379/0',
          ),
        },
      }),
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
    MailerModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
