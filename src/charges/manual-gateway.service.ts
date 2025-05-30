import { Injectable } from '@nestjs/common';
import { GatewayFactory } from './gateway.factory';
import { ChargesRepository } from './charges.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Charge } from './entities/charge.entity';
import { randomUUID } from 'crypto';
import { PayChargeDto } from './dto/pay-charge.dto';

@Injectable()
export class ManualGatewayService implements GatewayFactory {
  constructor(
    private readonly chargesRepository: ChargesRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  process(charge: Charge, payChargeDto: PayChargeDto): Promise<Charge> {
    const updatedCharge = this.chargesRepository.update(charge.id, {
      status: 'COMPLETED',
      gatewayChargeID: `MANUAL:${randomUUID()}`,
      paidAt: new Date(),
      gateway: payChargeDto.gateway,
      paymentMethod: payChargeDto.paymentMethod,
    });

    this.eventEmitter.emit('charge.completed', updatedCharge);

    return updatedCharge;
  }
}
