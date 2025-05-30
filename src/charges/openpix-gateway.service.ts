import { Injectable } from '@nestjs/common';
import { GatewayFactory } from './gateway.factory';
import { ChargesRepository } from './charges.repository';
import { Charge } from './entities/charge.entity';
import { OpenPixService } from 'openpix-nestjs';
import { format } from 'date-fns';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import * as math from 'mathjs';
import { PayChargeDto } from './dto/pay-charge.dto';

@Injectable()
export class OpenPixGatewayService implements GatewayFactory {
  constructor(
    private readonly chargesRepository: ChargesRepository,
    private readonly openPixService: OpenPixService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async process(charge: Charge, payChargeDto: PayChargeDto): Promise<Charge> {
    const correlationID = format(new Date(), 'yyyyMMddHHmmssSSS');
    const payment = await this.openPixService.charge.create({
      value: math.add(charge.amount, charge.additionalFee ?? 0),
      comment: charge.description ?? undefined,
      correlationID: charge.correlationID || correlationID,
    });

    const updatedCharge = await this.chargesRepository.update(
      charge.id,
      {
        gateway: payChargeDto.gateway,
        expiresIn: payment.expiresIn,
        gatewayChargeID: payment.transactionID,
        expiresAt: payment.expiresDate,
        correlationID: charge.correlationID || correlationID,
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

  @OnEvent('openpix.charges.paid', { async: true })
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

    this.eventEmitter.emit('charges.completed', updatedCharge);
  }
}
