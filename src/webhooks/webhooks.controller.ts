import { Body, Controller, Param } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { Endpoint } from '@/helpers/decorators/endpoint.decorator';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Endpoint({
    method: 'POST',
    path: 'charges/:gateway',
    isPublic: true,
    documentation: {
      summary: 'Handle charge webhook from payment gateway',
      description:
        'Endpoint to receive and process charge webhooks from various payment gateways.',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              additionalProperties: false,
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Webhook received and processed successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  gateway: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  })
  handleChargeWebhook(@Param('gateway') gateway: string, @Body() body: any) {
    this.webhooksService.handleChargeWebhook(gateway, body);
    return {
      gateway,
      message: 'Webhook received',
    };
  }
}
