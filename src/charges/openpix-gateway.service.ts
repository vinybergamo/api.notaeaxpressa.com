import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GatewayFactory } from './gateway.factory';
import { ChargesRepository } from './charges.repository';
import { Charge } from './entities/charge.entity';
import { OpenPixService } from 'openpix-nestjs';
import { add, format } from 'date-fns';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import * as math from 'mathjs';
import { ChargeRefunds } from './entities/charge-refunds';
import { ChargeRefundsRepository } from './charge-refunds.repository';
import { GatewaysRepository } from './gateways.repository';
import { createClient } from '@woovi/node-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OpenPixGatewayService implements GatewayFactory {
  constructor(
    private readonly chargesRepository: ChargesRepository,
    private readonly openPixService: OpenPixService,
    private readonly chargeRefundsRepository: ChargeRefundsRepository,
    private readonly gatewaysRepository: GatewaysRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly configService: ConfigService,
  ) {}

  async process(charge: Charge): Promise<Charge> {
    const correlationID = format(new Date(), 'yyyyMMddHHmmssSSS');
    const gateway = await this.gatewaysRepository.findOneOrFail({
      bank: 'OPENPIX',
      company: {
        id: charge.company.id,
      },
    });

    if (!gateway.clientId || !gateway.clientSecret) {
      throw new BadRequestException(
        'GATEWAY_NOT_CONFIGURED',
        `Gateway OPENPIX not configured for company ${charge.company.id}. Please configure the gateway before processing charges.`,
      );
    }

    const appId = Buffer.from(
      `${gateway.clientId}:${gateway.clientSecret}`,
    ).toString('base64');

    const woovi = createClient({
      appId,
      baseUrl: gateway.isSandbox
        ? 'https://api.woovi-sandbox.com'
        : 'https://api.openpix.com',
    });

    const existsPaymet = await woovi.charge
      .get({
        id: charge.correlationID,
      })
      .then((res) => res.charge)
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
            gatewayEntity: gateway,
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
            gatewayEntity: gateway,
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
            gateway: gateway.bank,
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
            gatewayEntity: gateway,
            metadata: updatedPayment,
          },
          {
            relations: ['customer'],
          },
        );
      }
    }

    const payment = (await woovi.charge
      .create({
        value: math.add(charge.amount, charge.additionalFee ?? 0),
        comment: charge.description ?? undefined,
        correlationID: charge.correlationID || correlationID,
      })
      .then((res) => res.charge)) as any;

    const updatedCharge = await this.chargesRepository.update(
      charge.id,
      {
        gateway: gateway.bank,
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
        gatewayEntity: gateway,
      },
      {
        relations: ['customer'],
      },
    );

    return updatedCharge;
  }

  async refund(chargeRefund: ChargeRefunds) {
    const payment = await this.openPixService.charge.get(
      chargeRefund.charge.correlationID,
    );

    const transaction = await this.openPixService.transaction.get(
      payment.transactionID,
    );

    if (!payment) {
      throw new NotFoundException('CHARGE_NOT_FOUND');
    }

    if (payment.paymentMethods?.pix?.status !== 'COMPLETED') {
      throw new BadRequestException('CHARGE_NOT_COMPLETED');
    }

    const refund = await this.openPixService.refunds
      .refund({
        correlationID: chargeRefund.correlationID,
        transactionEndToEndId: transaction.endToEndId,
        value: chargeRefund.amount,
        comment: chargeRefund.comment,
      })
      .catch((error) => {
        console.error('Error processing refund:', error);
        throw error;
      });

    if (!refund) {
      throw new BadRequestException('REFUND_FAILED');
    }

    const updatedChargeRefund = await this.chargeRefundsRepository.update(
      chargeRefund.id,
      {
        status: refund.pixTransactionRefund.status,
        refundedAt: new Date(refund.pixTransactionRefund?.time || Date.now()),
        gatewayId: refund.pixTransactionRefund?.returnIdentification,
        refundId: refund.pixTransactionRefund?.refundId,
        metadata: refund,
      },
      {
        relations: ['charge'],
      },
    );

    return updatedChargeRefund;
  }

  @OnEvent('OPENPIX:CHARGE_COMPLETED', { async: true })
  async onChargePaid(payload: any): Promise<void> {
    try {
      const transactions = await this.openPixService.transaction.list({
        charge: payload.identifier,
      });
      const transaction = transactions.transactions.find(
        (t) =>
          t.charge?.identifier === payload.identifier &&
          t.type === 'PAYMENT' &&
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
          endToEndId: transaction?.endToEndId,
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

  @OnEvent('OPENPIX:CHARGE_EXPIRED', { async: true })
  async onChargeExpired(payload: any): Promise<void> {
    try {
      const payment = await this.openPixService.charge.get(payload.identifier);
      const charge = await this.chargesRepository.findOne({
        correlationID: payload.correlationID,
      });

      if (!charge) {
        return;
      }

      if (charge.status === 'EXPIRED') {
        return;
      }

      const updatedCharge = await this.chargesRepository.update(
        charge.id,
        {
          pix: payment?.paymentMethods?.pix,
          metadata: payment,
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

      this.eventEmitter.emit('charges.pix.expired', updatedCharge);
    } catch (error) {
      console.error('Error processing charge expired event:', error);
    }
  }
}
