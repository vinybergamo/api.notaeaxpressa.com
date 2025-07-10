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
import { RefundChargeDto } from './dto/refund-charge.dto';
import { ChargeRefundsRepository } from './charge-refunds.repository';
import { CompaniesRepository } from '@/companies/companies.repository';
import { whereId } from '@/utils/where-id';
import { GatewaysRepository } from './gateways.repository';
import { ILike } from 'typeorm';

@Injectable()
export class ChargesService {
  constructor(
    private readonly chargesRepository: ChargesRepository,
    private readonly openPixGatewayService: OpenPixGatewayService,
    private readonly customersRepository: CustomersRepository,
    private readonly chargeRefundsRepository: ChargeRefundsRepository,
    private readonly companiesRepository: CompaniesRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly gatewaysRepository: GatewaysRepository,
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

  async refund(
    me: UserRequest,
    chargeId: Id,
    refundChargeDto: RefundChargeDto,
  ) {
    const charge = await this.chargesRepository.findByIdOrFail(chargeId, {
      relations: this.chargesRepository.relations,
    });
    const refunds = await this.chargeRefundsRepository.find({
      charge: { id: charge.id },
    });

    if (charge.user.id !== me.id) {
      throw new NotFoundException(
        'CHARGE_NOT_FOUND',
        'Charge not found or does not belong to the user.',
      );
    }

    if (charge.status === 'CANCELED' || charge.status === 'PARTIAL_REFUNDED') {
      throw new BadRequestException(
        'CHARGE_ALREADY_REFUNDED',
        'This charge has already been refunded.',
      );
    }

    if (charge.status !== 'COMPLETED') {
      throw new BadRequestException(
        'CHARGE_NOT_COMPLETED',
        'Only completed charges can be refunded.',
      );
    }

    if (refundChargeDto.amount > charge.totalAmount) {
      throw new BadRequestException(
        'INVALID_REFUND_AMOUNT',
        `The refund amount cannot exceed the total charge amount (${charge.totalAmount}).`,
      );
    }

    const totalRefundedAmount = refunds.reduce(
      (total, refund) => total + refund.amount,
      0,
    );

    if (
      totalRefundedAmount + (refundChargeDto.amount || charge.amount) >
      charge.totalAmount
    ) {
      throw new BadRequestException(
        'INVALID_REFUND_AMOUNT',
        `The total refunded amount cannot exceed the total charge amount (${charge.totalAmount}).`,
      );
    }

    const refund = await this.chargeRefundsRepository.create({
      correlationID: txIdGenerate(
        `REFUND${charge.id}T${format(new Date(), 'yyyyMMddHHmmssSSS')}`,
      ),
      amount: refundChargeDto.amount || charge.amount,
      charge,
      status: 'PROCESSING',
      comment: refundChargeDto.comment,
    });

    this.eventEmitter.emit('charges.refund.create', refund);

    const gateway = await this.gatewaysRepository.findOneOrFail({
      name: ILike(`${charge.gateway}`),
      company: { id: charge.company.id },
    });

    return this.chosenGateway(gateway.bank).refund(refund);
  }

  async createCharge(
    user: UserRequest,
    createChargeDto: CreateChargeDto,
    application: Application | null = null,
  ) {
    const companyByIdQuery = createChargeDto.companyId
      ? this.companiesRepository.findOne(
          {
            ...whereId(createChargeDto.companyId),
            user: { id: user.id },
          },
          {
            relations: ['user'],
          },
        )
      : Promise.resolve(null);
    const companyDefaultQuery = this.companiesRepository.findOne(
      {
        user: { id: user.id },
        isDefault: true,
      },
      {
        relations: ['user'],
      },
    );

    const [companyById, companyDefault] = await Promise.all([
      companyByIdQuery,
      companyDefaultQuery,
    ]);

    const company = companyById || companyDefault;

    if (!company) {
      throw new NotFoundException(
        'COMPANY_NOT_FOUND',
        'No default company found for the user.',
      );
    }

    if (company.user.id !== user.id) {
      throw new NotFoundException(
        'COMPANY_NOT_FOUND',
        'Company not found or does not belong to the user.',
      );
    }

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
      invoiceServiceCode: createChargeDto?.invoice?.serviceCode,
      customer,
      application,
      user,
      company,
    });

    return charge;
  }

  async pay(chargeId: Id, payChargeDto: PayChargeDto, index = 0) {
    const charge = await this.chargesRepository.findByIdOrFail(chargeId, {
      relations: this.chargesRepository.relations,
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
      const gateway = await this.gatewaysRepository.findOneOrFail({
        name: ILike(`${sortedPaymentMethods[index].gateway}`),
        company: { id: charge.company.id },
      });

      const updatedCharge = await this.chargesRepository.update(
        charge.id,
        {
          gateway: gateway,
        },
        {
          relations: this.chargesRepository.relations,
        },
      );

      const payment = await this.chosenGateway(gateway.bank).process(
        updatedCharge,
      );

      if (charge.paymentMethod !== payChargeDto.paymentMethod) {
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
        relations: this.chargesRepository.relations,
      },
    );

    this.eventEmitter.emit('charges.view', charge);

    return charge;
  }

  async createOneStep(
    user: UserRequest,
    createChargeDto: CreateOneStepChargeDto,
  ) {
    this.validateGateway(
      createChargeDto.gateway,
      createChargeDto.paymentMethod,
    );

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
