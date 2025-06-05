import { Body, Controller, Query, Req } from '@nestjs/common';
import { PlansService } from './plans.service';
import { Endpoint } from '@/helpers/decorators/endpoint.decorator';
import { Me } from '@/helpers/decorators/me.decorator';
import { CreatePlanDto } from './dto/create-plan.dto';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { Request } from 'express';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Endpoint({
    method: 'GET',
  })
  list(
    @Me() user: UserRequest,
    @Paginate() paginateQuery: PaginateQuery,
    @Query('relations') relations: string,
  ) {
    return this.plansService.list(user, paginateQuery, relations || '');
  }

  @Endpoint({
    method: 'POST',
  })
  create(
    @Me() user: UserRequest,
    @Body() createPlanDto: CreatePlanDto,
    @Req() req: Request,
  ) {
    return this.plansService.create(user, createPlanDto, req.application);
  }
}
