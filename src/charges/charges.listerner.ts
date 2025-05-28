import { Injectable } from '@nestjs/common';
import { OnChargePaid } from '@/helpers/decorators/charge.decorator';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ChargesListener {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  @OnChargePaid()
  async onChargePaid(charge: { gateway: string; payload: any }): Promise<void> {
    this.eventEmitter.emit(
      `${charge.gateway.toLowerCase()}.charge.paid`,
      charge.payload.charge,
    );
  }
}
