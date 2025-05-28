import { Injectable, Logger } from '@nestjs/common';
import { OnChargePaid } from '@/helpers/decorators/charge.decorator';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ChargesListener {
  private readonly logger = new Logger(ChargesListener.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  @OnChargePaid()
  async onChargePaid(charge: { gateway: string; payload: any }): Promise<void> {
    this.eventEmitter.emit(
      `${charge.gateway.toLowerCase()}.charges.paid`,
      charge.payload.charge,
    );
  }
}
