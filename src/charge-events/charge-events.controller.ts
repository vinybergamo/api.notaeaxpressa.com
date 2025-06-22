import { Controller, Param } from '@nestjs/common';
import { ChargeEventsService } from './charge-events.service';
import { Endpoint } from '@/helpers/decorators/endpoint.decorator';

@Controller('charge-events')
export class ChargeEventsController {
  constructor(private readonly chargeEventsService: ChargeEventsService) {}

  @Endpoint({
    method: 'GET',
    path: ':chargeId',
  })
  getChargeEvents(@Param('chargeId') chargeId: string) {
    return this.chargeEventsService.getChargeEvents(chargeId);
  }
}
