import { Injectable } from '@nestjs/common';
import { GatewayFactory } from './gateway.factory';
import { ChargesRepository } from './charges.repository';
import { Charge } from './entities/charge.entity';
import { OpenPixService } from 'openpix-nestjs';
import { format } from 'date-fns';

@Injectable()
export class OpenPixGatewayService implements GatewayFactory {
  constructor(
    private readonly chargesRepository: ChargesRepository,
    private readonly openPixService: OpenPixService,
  ) {}

  async process(charge: Charge): Promise<Charge> {
    const correlationID = format(new Date(), 'yyyyMMddHHmmssSSS');
    const payment = await this.openPixService.charge.create({
      value: charge.amount,
      comment: charge.description,
      correlationID: correlationID,
    });

    const updatedCharge = await this.chargesRepository.update(charge.id, {
      expiresIn: payment.expiresIn,
      gatewayChargeID: payment.transactionID,
      expiresAt: payment.expiresDate,
      correlationID,
      fee: payment.fee,
      url: payment.paymentLinkUrl,
      paymentMethod: 'PIX',
      pix: payment?.paymentMethods?.pix,
      metadata: payment,
    });

    return updatedCharge;
  }
}
