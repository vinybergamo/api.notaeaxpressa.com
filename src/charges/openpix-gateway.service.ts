import { Injectable } from '@nestjs/common';
import { GatewayFactory } from './gateway.factory';
import { ChargesRepository } from './charges.repository';
import { Charge } from './entities/charge.entity';
import { OpenPixService } from 'openpix-nestjs';
import { add, format } from 'date-fns';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import * as math from 'mathjs';

@Injectable()
export class OpenPixGatewayService implements GatewayFactory {
  constructor(
    private readonly chargesRepository: ChargesRepository,
    private readonly openPixService: OpenPixService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async process(charge: Charge): Promise<Charge> {
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
            gateway: 'OPENPIX',
            gatewayChargeID: existsPaymet.transactionID,
            correlationID: charge.correlationID || correlationID,
            fee: existsPaymet.fee,
            url: existsPaymet.paymentLinkUrl,
            paymentMethod: 'PIX',
            pix: {
              ...existsPaymet?.paymentMethods?.pix,
              key: existsPaymet?.pixKey,
              expiresAt: new Date(existsPaymet.expiresDate),
              expiresIn: existsPaymet.expiresIn,
            },
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

        await this.openPixService.charge.update(charge.correlationID, {
          expiresDate: newDate,
        });

        const updatedPayment = await this.openPixService.charge.get(
          charge.correlationID,
        );

        return await this.chargesRepository.update(
          charge.id,
          {
            gateway: 'OPENPIX',
            gatewayChargeID: updatedPayment.transactionID,
            correlationID: charge.correlationID || correlationID,
            fee: updatedPayment.fee,
            url: updatedPayment.paymentLinkUrl,
            paymentMethod: 'PIX',
            pix: {
              ...updatedPayment?.paymentMethods?.pix,
              key: updatedPayment?.pixKey,
              expiresAt: new Date(updatedPayment.expiresDate),
              expiresIn: updatedPayment.expiresIn,
            },
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
        gateway: 'OPENPIX',
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
    try {
      const transactions = await this.openPixService.transaction.list({
        charge: payload.identifier,
      });
      const transaction = transactions.transactions.find(
        (t) =>
          t.charge?.identifier === payload.identifier &&
          t.charge.status === 'COMPLETED',
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

      const updatedCharge = await this.chargesRepository.update(
        charge.id,
        {
          pix: payment?.paymentMethods?.pix,
          status: 'COMPLETED',
          paidAt: new Date(transaction.charge.paidAt),
          metadata: transaction || payment,
        },
        {
          relations: [
            'customer',
            'user',
            'company',
            'subscription',
            'application',
          ],
        },
      );

      this.eventEmitter.emit('charges.completed', updatedCharge);
    } catch (error) {
      console.error('Error processing charge paid event:', error);
    }
  }
}
