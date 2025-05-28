import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChargesRepository } from './charges.repository';
import { gateways } from './gateways.const';
import { CreateOneStepChargeDto } from './dto/create-one-step-charge.dto';
import { Charge } from './entities/charge.entity';
import { OpenPixGatewayService } from './openpix-gateway.service';
import { CustomersRepository } from '@/customers/customers.repository';
import { format } from 'date-fns';
import { ManualGatewayService } from './manual-gateway.service';

@Injectable()
export class ChargesService {
  constructor(
    private readonly chargesRepository: ChargesRepository,
    private readonly openPixGatewayService: OpenPixGatewayService,
    private readonly customersRepository: CustomersRepository,
    private readonly manualGatewayService: ManualGatewayService,
  ) {}

  async createOneStep(
    user: UserRequest,
    createChargeDto: CreateOneStepChargeDto,
  ) {
    this.validateGateway(createChargeDto.gateway, [
      createChargeDto.paymentMethod,
    ]);
    const charges = await this.chargesRepository.find({
      user: { id: user.id },
    });
    const customer = createChargeDto.customerId
      ? await this.customersRepository.findByIdOrFail(
          createChargeDto.customerId,
          {
            relations: ['user'],
          },
        )
      : null;

    if (customer && customer.user.id !== user.id) {
      throw new NotFoundException(
        'CUSTOMER_NOT_FOUND',
        'Customer not found or does not belong to the user.',
      );
    }

    const charge = await this.chargesRepository.create({
      ...createChargeDto,
      index: charges.length + 1,
      correlationID: `${user.id}${format(new Date(), 'yyyyMMddHHmmssSSS')}`,
      methods: [createChargeDto.paymentMethod],
      customer,
      user: {
        id: user.id,
      },
    });

    return this.chosenGateway(charge).create(charge);
  }

  private chosenGateway(charge: Charge) {
    const gateway = charge.gateway.toUpperCase();
    switch (gateway) {
      case 'OPENPIX':
        return this.openPixGatewayService;
      case 'MANUAL':
        return this.manualGatewayService;
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
