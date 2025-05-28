import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

const openPixEventMapper = {
  CHARGE_COMPLETED: 'charges.paid',
};

@Injectable()
export class WebhooksService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  handleChargeWebhook(gateway: string, body: any) {
    return this.chooseGateway(gateway, body);
  }

  private chooseGateway(gateway: string, body: any) {
    switch (gateway.toUpperCase()) {
      case 'OPENPIX':
        return this.handleOpenPixWebhook(body);
      default:
    }
  }

  private handleOpenPixWebhook(body: any) {
    const [gateway, event] = body.event.split(':');
    this.eventEmitter.emit(openPixEventMapper[event], {
      gateway,
      payload: body,
    });
  }
}
