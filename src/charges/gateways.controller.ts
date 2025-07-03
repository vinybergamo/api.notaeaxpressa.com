import { Body, Controller } from '@nestjs/common';
import { GatewaysService } from './gateways.service';
import { Endpoint } from '@/helpers/decorators/endpoint.decorator';
import { Me } from '@/helpers/decorators/me.decorator';
import { CreateGatewayDto } from './dto/create-gateway.dto';

@Controller('gateways')
export class GatewaysController {
  constructor(private readonly gatewaysService: GatewaysService) {}

  @Endpoint({
    method: 'POST',
    throttle: {
      options: {
        default: {
          limit: 10,
        },
      },
    },
  })
  createGateway(
    @Me() user: UserRequest,
    @Body() createGatewayDto: CreateGatewayDto,
  ) {
    return this.gatewaysService.create(user, createGatewayDto);
  }
}
