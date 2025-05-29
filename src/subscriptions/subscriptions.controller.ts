import { Body, Controller } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { Endpoint } from '@/helpers/decorators/endpoint.decorator';
import { Me } from '@/helpers/decorators/me.decorator';
import { CreateSubscriptionDto } from './dto/crate-subscription';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Endpoint({
    method: 'POST',
  })
  create(
    @Me() me: UserRequest,
    @Body() createSubscriptionDto: CreateSubscriptionDto,
  ) {
    return this.subscriptionsService.create(me, createSubscriptionDto);
  }
}
