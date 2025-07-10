import { Injectable, NotFoundException } from '@nestjs/common';
import { GatewaysRepository } from './gateways.repository';
import { CreateGatewayDto } from './dto/create-gateway.dto';
import { whereId } from '@/utils/where-id';
import { CompaniesRepository } from '@/companies/companies.repository';
import { ILike } from 'typeorm';

@Injectable()
export class GatewaysService {
  constructor(
    private readonly gatewaysRepository: GatewaysRepository,
    private readonly companiesRepository: CompaniesRepository,
  ) {}

  async list(user: UserRequest, companyId?: Id) {
    const companyByIdQuery = companyId
      ? this.companiesRepository.findOne(
          {
            ...whereId(companyId),
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

    const gateways = await this.gatewaysRepository.find(
      {
        company: { id: company.id },
      },
      {
        relations: ['company'],
      },
    );

    return gateways;
  }

  async listByPaymentMethod(user: UserRequest, companyId?: Id) {
    const gateways = await this.list(user, companyId);

    const result: Record<
      string,
      {
        gateway: string;
        method: string;
      }[]
    > = {};

    for (const gateway of gateways) {
      for (const method of gateway.paymentMethods ?? []) {
        if (!result[method]) {
          result[method] = [];
        }
        result[method].push({
          gateway: gateway.name,
          method: method,
        });
      }
    }

    return result;
  }

  async create(user: UserRequest, createGatewayDto: CreateGatewayDto) {
    const companyByIdQuery = createGatewayDto.companyId
      ? this.companiesRepository.findOne(
          {
            ...whereId(createGatewayDto.companyId),
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

    const existsGateway = await this.gatewaysRepository.exists({
      company: { id: company.id },
      name: ILike(`%${createGatewayDto.name}%`),
    });

    if (existsGateway) {
      throw new NotFoundException(
        'GATEWAY_ALREADY_EXISTS',
        `Gateway with name [${createGatewayDto.name}] already exists for this company.`,
      );
    }

    const gateway = this.gatewaysRepository.create({
      ...createGatewayDto,
      company,
    });

    return gateway;
  }
}
