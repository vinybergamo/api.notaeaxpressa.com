import { Body, Controller } from '@nestjs/common';
import { ChargesService } from './charges.service';
import { Endpoint } from '@/helpers/decorators/endpoint.decorator';
import { CreateChargeDto } from './dto/create-charge.dto';
import { Me } from '@/helpers/decorators/me.decorator';

@Controller('charges')
export class ChargesController {
  constructor(private readonly chargesService: ChargesService) {}

  @Endpoint({
    method: 'POST',
  })
  create(@Me() me: UserRequest, @Body() createChargeDto: CreateChargeDto) {
    return this.chargesService.create(me, createChargeDto);
  }
}
