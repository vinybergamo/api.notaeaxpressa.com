import { Body, Controller, Param, Query, Req } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { Endpoint } from '@/helpers/decorators/endpoint.decorator';
import { Me } from '@/helpers/decorators/me.decorator';
import { CreateSubscriptionDto } from './dto/crate-subscription';
import { Request } from 'express';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Endpoint({
    method: 'GET',
    path: ':id',
  })
  findOne(
    @Me() me: UserRequest,
    @Param('id') id: Id,
    @Query('relations') relations: string,
  ) {
    return this.subscriptionsService.findOne(
      me,
      id,
      relations ? relations.split(/,;/) : [],
    );
  }

  @Endpoint({
    method: 'POST',
  })
  create(
    @Me() me: UserRequest,
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    @Req() req: Request,
  ) {
    return this.subscriptionsService.create(
      me,
      createSubscriptionDto,
      req.application,
    );
  }
}
