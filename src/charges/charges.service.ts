import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChargesRepository } from './charges.repository';
import { gateways } from './gateways.const';
import { CreateOneStepChargeDto } from './dto/create-one-step-charge.dto';
import { OpenPixGatewayService } from './openpix-gateway.service';
import { CustomersRepository } from '@/customers/customers.repository';
import { format } from 'date-fns';
import { PaginateQuery } from 'nestjs-paginate';
import { PayChargeDto } from './dto/pay-charge.dto';
import { txIdGenerate } from '@/utils/txid-generate';
import { isUUID } from 'class-validator';
import { Application } from '@/applications/entities/application.entity';
import { CreateChargeDto } from './dto/create-charge.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ChargesService {
  constructor(
    private readonly chargesRepository: ChargesRepository,
    private readonly openPixGatewayService: OpenPixGatewayService,
    private readonly customersRepository: CustomersRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async list(
    user: UserRequest,
    paginateQuery: PaginateQuery,
    relations?: string,
  ) {
    return this.chargesRepository.list(
      user.id,
      paginateQuery,
      relations.split(/[;,\s]+/).filter(Boolean) || [],
    );
  }

  async createCharge(
    user: UserRequest,
    createChargeDto: CreateChargeDto,
    application: Application | null = null,
  ) {
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

    const customerId = customer ? `CUS${customer.id}` : '';
    const applicationId = application ? `APP${application.id}` : '';

    const charge = await this.chargesRepository.create({
      ...createChargeDto,
      index: charges.length + 1,
      correlationID: txIdGenerate(
        `${applicationId}USER${user.id}${customerId}T${format(new Date(), 'yyyyMMddHHmmssSSS')}`,
      ),
      customer,
      application,
      user: {
        id: user.id,
      },
    });

    return charge;
  }

  async pay(chargeId: Id, payChargeDto: PayChargeDto, index = 0) {
    const charge = await this.chargesRepository.findByIdOrFail(chargeId, {
      relations: ['user', 'customer', 'subscription', 'application', 'company'],
    });

    const chargePaymentMethods = charge.paymentMethods || [];

    const paymentMethodGateways = chargePaymentMethods.filter(
      (method) =>
        method.method.toUpperCase() ===
        payChargeDto.paymentMethod.toUpperCase(),
    );

    const sortedPaymentMethods = paymentMethodGateways.sort(
      (a, b) => a.priority - b.priority,
    );

    if (sortedPaymentMethods.length === 0) {
      throw new BadRequestException(
        'PAYMENT_METHOD_NOT_FOUND',
        `Payment method [${payChargeDto.paymentMethod}] not found for charge.`,
      );
    }

    try {
      const gateway = sortedPaymentMethods[index].gateway;
      this.validateGateway(gateway, payChargeDto.paymentMethod);
      const payment = await this.chosenGateway(gateway).process(charge);

      if (payment.paymentMethod !== payChargeDto.paymentMethod) {
        this.eventEmitter.emit('charges.paymentMethod.update', payment);
      }

      return payment;
    } catch (error) {
      if (index < sortedPaymentMethods.length - 1) {
        return this.pay(chargeId, payChargeDto, index + 1);
      }
      throw error;
    }
  }

  async getPublicCharge(uuid: string) {
    const isValidUUID = isUUID(uuid);

    if (!isValidUUID) {
      throw new BadRequestException(
        'INVALID_UUID',
        'The provided UUID is not valid.',
      );
    }

    const charge = await this.chargesRepository.findOneOrFail(
      {
        uuid,
      },
      {
        relations: [
          'customer',
          'subscription',
          'user',
          'subscription.plan',
          'company',
        ],
      },
    );

    this.eventEmitter.emit('charges.view', charge);

    return charge;
  }

  async createOneStep(
    user: UserRequest,
    createChargeDto: CreateOneStepChargeDto,
    application: Application | null = null,
  ) {
    this.validateGateway(
      createChargeDto.gateway,
      createChargeDto.paymentMethod,
    );
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

    const customerId = customer ? `CUS${customer.id}` : '';
    const applicationId = application ? `APP${application.id}` : '';

    const charge = await this.chargesRepository.create({
      ...createChargeDto,
      index: charges.length + 1,
      correlationID: txIdGenerate(
        `${applicationId}USER${user.id}${customerId}T${format(new Date(), 'yyyyMMddHHmmssSSS')}`,
      ),
      paymentMethods: [
        {
          gateway: createChargeDto.gateway,
          method: createChargeDto.paymentMethod,
          priority: 1,
        },
      ],
      customer,
      application,
      user: {
        id: user.id,
      },
    });

    return this.chosenGateway(createChargeDto.gateway).process(charge);
  }

  private chosenGateway(gateway: string) {
    switch (gateway.toUpperCase().trim()) {
      case 'OPENPIX':
        return this.openPixGatewayService;
      default:
        throw new BadRequestException(
          `UNSUPPORTED_GATEWAY`,
          `The gateway "${gateway}" is not supported.`,
        );
    }
  }

  private validateGateway(gateway: string, method: string): void {
    const validGateways = Object.keys(gateways).map((key) => key.toUpperCase());

    if (!validGateways.includes(gateway.toUpperCase().trim())) {
      throw new BadRequestException(
        `INVALID_GATEWAY`,
        `The gateway [${gateway}] is not supported. Supported gateways are: ${validGateways.join(', ').toUpperCase()}`,
      );
    }
    const gatewayMethods = gateways[gateway.toLowerCase()].map((m) =>
      m.toLowerCase(),
    );

    if (!gatewayMethods.includes(method.toLowerCase())) {
      throw new BadRequestException(
        `INVALID_PAYMENT_METHOD`,
        `The payment method [${method}] is not supported for the gateway [${gateway}]. Supported methods are: ${gatewayMethods.join(', ').toUpperCase()}`,
      );
    }
  }
}
