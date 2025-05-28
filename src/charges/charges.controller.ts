import { Body, Controller } from '@nestjs/common';
import { ChargesService } from './charges.service';
import { Endpoint } from '@/helpers/decorators/endpoint.decorator';
import { CreateOneStepChargeDto } from './dto/create-one-step-charge.dto';
import { Me } from '@/helpers/decorators/me.decorator';

@Controller('charges')
export class ChargesController {
  constructor(private readonly chargesService: ChargesService) {}

  @Endpoint({
    method: 'POST',
    path: 'one-step',
  })
  create(
    @Me() me: UserRequest,
    @Body() createChargeDto: CreateOneStepChargeDto,
  ) {
    return this.chargesService.createOneStep(me, createChargeDto);
  }
}
