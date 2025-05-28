import { Injectable } from '@nestjs/common';
import { GatewayFactory } from './gateway.factory';
import { ChargesRepository } from './charges.repository';
import { Charge } from './entities/charge.entity';
import { OpenPixService } from 'openpix-nestjs';
import { format } from 'date-fns';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import * as math from 'mathjs';

@Injectable()
export class OpenPixGatewayService implements GatewayFactory {
  constructor(
    private readonly chargesRepository: ChargesRepository,
    private readonly openPixService: OpenPixService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(charge: Charge): Promise<Charge> {
    const correlationID = format(new Date(), 'yyyyMMddHHmmssSSS');
    const payment = await this.openPixService.charge.create({
      value: math.add(charge.amount, charge.additionalFee ?? 0),
      comment: charge.description,
      correlationID: charge.correlationID || correlationID,
    });

    const updatedCharge = await this.chargesRepository.update(
      charge.id,
      {
        expiresIn: payment.expiresIn,
        gatewayChargeID: payment.transactionID,
        expiresAt: payment.expiresDate,
        correlationID,
        fee: payment.fee,
        url: payment.paymentLinkUrl,
        paymentMethod: 'PIX',
        pix: payment?.paymentMethods?.pix,
        metadata: payment,
      },
      {
        relations: ['customer'],
      },
    );

    return updatedCharge;
  }

  @OnEvent('openpix.charge.paid', { async: true })
  async onChargePaid(payload: any): Promise<void> {
    const transaction = await this.openPixService.transaction.get(
      payload.transactionID,
    );
    const payment = await this.openPixService.charge.get(payload.identifier);

    const charge = await this.chargesRepository.findOne({
      correlationID: payload.correlationID,
    });

    if (!charge) {
      return;
    }

    if (charge.status === 'COMPLETED') {
      return;
    }

    const updatedCharge = await this.chargesRepository.update(charge.id, {
      pix: payment?.paymentMethods?.pix,
      status: 'COMPLETED',
      paidAt: new Date(transaction.charge.paidAt),
      metadata: transaction,
    });

    this.eventEmitter.emit('charge.completed', updatedCharge);
  }
}
