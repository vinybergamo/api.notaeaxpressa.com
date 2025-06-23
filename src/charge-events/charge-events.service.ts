import { Injectable } from '@nestjs/common';
import { ChargeEventsRepository } from './charge-events.repository';
import {
  OnChargeCompleted,
  OnChargeCreate,
  OnChargePaymentMethodUpdate,
  OnchargeView,
} from '@/helpers/decorators/charge.decorator';
import { Charge } from '@/charges/entities/charge.entity';
import { ChargesRepository } from '@/charges/charges.repository';

@Injectable()
export class ChargeEventsService {
  constructor(
    private readonly chargeEventsRepository: ChargeEventsRepository,
    private readonly chargeRepository: ChargesRepository,
  ) {}

  async getChargeEvents(chargeId: Id) {
    const charge = await this.chargeRepository.findByIdOrFail(chargeId);

    return this.chargeEventsRepository.find(
      {
        charge: { id: charge.id },
      },
      {
        order: {
          id: 'DESC',
        },
      },
    );
  }

  @OnChargeCreate()
  async onChargeCreate(charge: Charge) {
    const count = await this.chargeEventsRepository.count({
      charge: { id: charge.id },
    });
    await this.chargeEventsRepository.create({
      charge,
      index: count + 1,
      createdAt: new Date(charge.createdAt),
      updatedAt: new Date(charge.updatedAt),
      user: charge.user,
      company: charge.company,
      type: 'CHARGE_CREATED',
      customer: charge.customer,
      data: charge,
    });
  }

  @OnchargeView()
  async onChargeView(charge: Charge) {
    const count = await this.chargeEventsRepository.count({
      charge: { id: charge.id },
    });

    const existingEvent = await this.chargeEventsRepository.findOne({
      charge: { id: charge.id },
      type: 'CHARGE_VIEWED',
    });

    if (existingEvent) {
      return;
    }

    await this.chargeEventsRepository.create({
      charge,
      index: count + 1,
      user: charge.user,
      company: charge.company,
      customer: charge.customer,
      type: 'CHARGE_VIEWED',
      data: charge,
    });
  }

  @OnChargeCompleted()
  async onChargeCompleted(charge: Charge) {
    const count = await this.chargeEventsRepository.count({
      charge: { id: charge.id },
    });
    await this.chargeEventsRepository.create({
      charge,
      createdAt: new Date(charge.paidAt),
      index: count + 1,
      user: charge.user,
      company: charge.company,
      customer: charge.customer,
      type: 'CHARGE_COMPLETED',
      data: charge,
    });
  }

  @OnChargePaymentMethodUpdate()
  async onChargePaymentMethodUpdate(charge: Charge) {
    const count = await this.chargeEventsRepository.count({
      charge: { id: charge.id },
    });
    const existingEvent = await this.chargeEventsRepository.findOne({
      charge: { id: charge.id },
      type: 'CHARGE_PAYMENT_METHOD_UPDATED',
    });
    if (existingEvent) {
      return;
    }
    await this.chargeEventsRepository.create({
      charge,
      index: count + 1,
      user: charge.user,
      company: charge.company,
      customer: charge.customer,
      type: 'CHARGE_PAYMENT_METHOD_UPDATED',
      data: charge,
    });
  }
}
