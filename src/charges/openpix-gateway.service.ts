import { Injectable } from '@nestjs/common';
import { GatewayFactory } from './gateway.factory';
import { ChargesRepository } from './charges.repository';
import { Charge } from './entities/charge.entity';
import { OpenPixService } from 'openpix-nestjs';
import { add, format } from 'date-fns';
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

    const existsPaymet = await this.openPixService.charge
      .get(charge.correlationID)
      .catch(() => null);

    if (!!existsPaymet) {
      const paymentStatus = existsPaymet.paymentMethods?.pix?.status;
      if (paymentStatus === 'COMPLETED') {
        return this.chargesRepository.update(
          charge.id,
          {
            status: 'COMPLETED',
            paidAt: new Date(existsPaymet.paidAt),
            gatewayChargeID: existsPaymet.transactionID,
            expiresIn: existsPaymet.expiresIn,
            expiresAt: existsPaymet.expiresDate,
            correlationID: charge.correlationID || correlationID,
            fee: existsPaymet.fee,
            url: existsPaymet.paymentLinkUrl,
            paymentMethod: 'PIX',
            pix: existsPaymet?.paymentMethods?.pix,
            metadata: existsPaymet,
          },
          {
            relations: ['customer'],
          },
        );
      }

      if (paymentStatus === 'ACTIVE') {
        return await this.chargesRepository.update(
          charge.id,
          {
            gateway: payChargeDto.gateway,
            expiresIn: existsPaymet.expiresIn,
            gatewayChargeID: existsPaymet.transactionID,
            expiresAt: existsPaymet.expiresDate,
            correlationID: charge.correlationID || correlationID,
            fee: existsPaymet.fee,
            url: existsPaymet.paymentLinkUrl,
            paymentMethod: 'PIX',
            pix: existsPaymet?.paymentMethods?.pix,
            metadata: existsPaymet,
          },
          {
            relations: ['customer'],
          },
        );
      }

      if (paymentStatus === 'EXPIRED') {
        const newDate = add(new Date(), {
          days: 1,
        });

        const updatedPayment = await this.openPixService.charge.update(
          charge.correlationID,
          {
            expiresDate: newDate,
          },
        );

        return await this.chargesRepository.update(
          charge.id,
          {
            gateway: payChargeDto.gateway,
            expiresIn: updatedPayment.expiresIn,
            gatewayChargeID: updatedPayment.transactionID,
            correlationID: charge.correlationID || correlationID,
            fee: updatedPayment.fee,
            url: updatedPayment.paymentLinkUrl,
            paymentMethod: 'PIX',
            pix: updatedPayment?.paymentMethods?.pix,
            metadata: updatedPayment,
          },
          {
            relations: ['customer'],
          },
        );
      }
    }

    const payment = await this.openPixService.charge.create({
      value: math.add(charge.amount, charge.additionalFee ?? 0),
      comment: charge.description ?? undefined,
      correlationID: charge.correlationID || correlationID,
    });

    const updatedCharge = await this.chargesRepository.update(
      charge.id,
      {
        gateway: payChargeDto.gateway,
        gatewayChargeID: payment.transactionID,
        correlationID: charge.correlationID || correlationID,
        fee: payment.fee,
        url: payment.paymentLinkUrl,
        paymentMethod: 'PIX',
        pix: {
          ...payment?.paymentMethods?.pix,
          key: payment?.pixKey,
          expiresAt: new Date(payment.expiresDate),
          expiresIn: payment.expiresIn,
        },
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
