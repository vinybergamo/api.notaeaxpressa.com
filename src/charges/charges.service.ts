import { BadRequestException, Injectable } from '@nestjs/common';
import { ChargesRepository } from './charges.repository';
import { gateways } from './gateways.const';
import { CreateOneStepChargeDto } from './dto/create-one-step-charge.dto';
import { Charge } from './entities/charge.entity';
import { OpenPixGatewayService } from './openpix-gateway.service';

@Injectable()
export class ChargesService {
  constructor(
    private readonly chargesRepository: ChargesRepository,
    private readonly openPixGatewayService: OpenPixGatewayService,
  ) {}

  async createOneStep(
    user: UserRequest,
    createChargeDto: CreateOneStepChargeDto,
  ) {
    this.validateGateway(createChargeDto.gateway, [
      createChargeDto.paymentMethod,
    ]);

    const charge = await this.chargesRepository.create({
      ...createChargeDto,
      methods: [createChargeDto.paymentMethod],
      user: {
        id: user.id,
      },
    });

    return this.chosenGateway(charge).process(charge);
  }

  private chosenGateway(charge: Charge) {
    const gateway = charge.gateway.toUpperCase();
    switch (gateway) {
      case 'OPENPIX':
        return this.openPixGatewayService;
      default:
        throw new BadRequestException(
          `UNSUPPORTED_GATEWAY`,
          `The gateway "${gateway}" is not supported.`,
        );
    }
  }

  private validateGateway(gateway: string, methods: string[]): void {
    const validGateways = Object.keys(gateways).map((key) => key.toUpperCase());

    if (!validGateways.includes(gateway.toUpperCase())) {
      throw new BadRequestException(
        `INVALID_GATEWAY`,
        `The gateway "${gateway}" is not supported. Supported gateways are: ${validGateways.join(', ').toUpperCase()}`,
      );
    }
    const gatewayMethods = gateways[gateway.toLowerCase()];

    for (const method of methods) {
      if (!gatewayMethods.includes(method)) {
        throw new BadRequestException(
          `INVALID_METHOD`,
          `The method "${method}" is not supported by the "${gateway}" gateway.`,
        );
      }
    }
  }
}
