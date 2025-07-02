import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class WebhooksService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  handleInvoiceWebhook(type: string, body: any) {
    this.eventEmitter.emit(`webhooks.invoice.${type}`, body);
  }

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
    this.eventEmitter.emit(body.event, body.charge);
  }
}
