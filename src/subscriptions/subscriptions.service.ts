import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SubscriptionsRepository } from './subscriptions.repository';
import { LessThanOrEqual } from 'typeorm';
import { add } from 'date-fns';
import { Subscription } from './entities/subscription.entity';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly subscriptionsRepository: SubscriptionsRepository,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleSubscriptions(): Promise<void> {
    const now = new Date();
    const subscriptions = await this.subscriptionsRepository.find(
      {
        status: 'ACTIVE',
        nextBillingDate: LessThanOrEqual(now),
      },
      {
        relations: ['customer', 'plan', 'charges'],
      },
    );

    if (subscriptions.length === 0) {
      return;
    }

    subscriptions.forEach(async (subscription) =>
      this.processSubscription(subscription),
    );
  }

  private async processSubscription(subscription: Subscription): Promise<void> {
    const nextBillingDate = this.getNextBillingDate(subscription);

    await this.subscriptionsRepository.update(subscription.id, {
      nextBillingDate,
    });
  }

  private getNextBillingDate(subscription: Subscription): Date {
    const now = new Date(subscription.nextBillingDate);
    switch (subscription.plan.interval) {
      case 'DAY':
        return add(now, {
          days: subscription.plan.intervalCount,
        });
      case 'WEEK':
        return add(now, {
          weeks: subscription.plan.intervalCount,
        });
      case 'MONTH':
        return add(now, {
          months: subscription.plan.intervalCount,
        });
      case 'YEAR':
        return add(now, {
          years: subscription.plan.intervalCount,
        });
      default:
        add(now, {
          days: subscription.plan.intervalCount,
        });
    }
  }
}
