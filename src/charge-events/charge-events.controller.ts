import { Controller } from '@nestjs/common';
import { ChargeEventsService } from './charge-events.service';

@Controller('charge-events')
export class ChargeEventsController {
  constructor(private readonly chargeEventsService: ChargeEventsService) {}
}
