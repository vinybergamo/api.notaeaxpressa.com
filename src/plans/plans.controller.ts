import { Body, Controller } from '@nestjs/common';
import { PlansService } from './plans.service';
import { Endpoint } from '@/helpers/decorators/endpoint.decorator';
import { Me } from '@/helpers/decorators/me.decorator';
import { CreatePlanDto } from './dto/create-plan.dto';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Endpoint({
    method: 'POST',
  })
  create(@Me() user: UserRequest, @Body() createPlanDto: CreatePlanDto) {
    return this.plansService.create(user, createPlanDto);
  }
}
