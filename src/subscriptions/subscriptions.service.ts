import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SubscriptionsRepository } from './subscriptions.repository';
import { LessThanOrEqual } from 'typeorm';
import { add, format, set } from 'date-fns';
import { Subscription } from './entities/subscription.entity';
import { ChargesRepository } from '@/charges/charges.repository';
import { CreateSubscriptionDto } from './dto/crate-subscription';
import { CustomersRepository } from '@/customers/customers.repository';
import { PlansRepository } from '@/plans/plans.repository';
import { txIdGenerate } from '@/utils/txid-generate';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    private readonly subscriptionsRepository: SubscriptionsRepository,
    private readonly chargesRepository: ChargesRepository,
    private readonly customersRepository: CustomersRepository,
    private readonly plansRepository: PlansRepository,
  ) {}

  async create(
    user: UserRequest,
    createSubscriptionDto: CreateSubscriptionDto,
  ): Promise<Subscription> {
    const now = new Date();
    const [customer, plan] = await Promise.all([
      this.customersRepository.findByIdOrFail(
        createSubscriptionDto.customerId,
        {
          relations: ['user'],
        },
      ),
      this.plansRepository.findByIdOrFail(createSubscriptionDto.planId, {
        relations: ['user'],
      }),
    ]);

    if (customer.user.id !== user.id) {
      throw new NotFoundException(
        'CUSTOMER_NOT_FOUND',
        'Customer not found or does not belong to the user.',
      );
    }

    if (plan.user.id !== user.id) {
      throw new NotFoundException(
        'PLAN_NOT_FOUND',
        'Plan not found or does not belong to the user.',
      );
    }

    if (plan.trialDays && plan.trialDays < 0) {
      throw new NotFoundException(
        'INVALID_TRIAL_DAYS',
        'Trial days must be a positive number.',
      );
    }

    if (!plan.isActive) {
      throw new NotFoundException(
        'PLAN_INACTIVE',
        'The selected plan is inactive.',
      );
    }

    const subscriptionsCount = await this.subscriptionsRepository.count({
      customer: { id: customer.id },
    });

    const subscription = await this.subscriptionsRepository.create({
      nextBillingDate: add(
        set(now, {
          seconds: 0,
          milliseconds: 0,
        }),
        {
          days: plan.trialDays || 0,
        },
      ),
      isTrial: !!plan.trialDays && plan.trialDays > 0,
      index: subscriptionsCount + 1,
      startDate: now,
      status: 'ACTIVE',
      plan,
      user,
      customer,
    });

    await this.processSubscription(subscription);

    return subscription;
  }

  @Cron(CronExpression.EVERY_MINUTE, {
    timeZone: 'America/Sao_Paulo',
  })
  async handleSubscriptions(): Promise<void> {
    const now = new Date();
    const subscriptions = await this.subscriptionsRepository.find(
      {
        status: 'ACTIVE',
        nextBillingDate: LessThanOrEqual(now),
      },
      {
        relations: ['customer', 'plan', 'charges', 'customer', 'user'],
      },
    );

    if (subscriptions.length === 0) {
      return;
    }

    this.logger.debug(
      `[${format(now, 'yyyy-MM-dd HH:mm:ss')}] Processing ${subscriptions.length} subscriptions`,
    );

    const results = await Promise.allSettled(
      subscriptions.map((subscription) =>
        this.processSubscription(subscription),
      ),
    );

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        this.logger.error(
          `Failed to process subscription ${subscriptions[index].id}: ${result.reason}`,
        );
      }
    });
  }

  private async processSubscription(subscription: Subscription): Promise<void> {
    const now = new Date();

    if (
      subscription.status !== 'ACTIVE' ||
      !subscription.nextBillingDate ||
      new Date(subscription.nextBillingDate) > now
    ) {
      return;
    }

    const correlationID = txIdGenerate(
      `SUB${subscription.id}USER${subscription.user.id}T${format(
        new Date(),
        'yyyyMMddHHmmssSSS',
      )}`,
    );
    const nextBillingDate = this.getNextBillingDate(subscription);
    const plan = subscription.plan;
    const customer = subscription.customer;
    const user = subscription.user;

    await this.subscriptionsRepository.update(subscription.id, {
      nextBillingDate,
      lastBillingDate: now,
      isTrial: false,
    });

    const chargesCount = await this.chargesRepository.count({
      user: { id: user.id },
    });

    await this.chargesRepository.create({
      index: chargesCount + 1,
      amount: plan.price,
      additionalFee: plan.fee,
      currency: plan.currency,
      methods: plan.paymentMethods,
      tags: plan.tags,
      correlationID,
      customer,
      subscription,
      user,
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
        return add(now, {
          days: subscription.plan.intervalCount,
        });
    }
  }

  onModuleInit() {
    this.handleSubscriptions();
  }
}
