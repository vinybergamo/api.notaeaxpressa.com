import { BadRequestException, Injectable } from '@nestjs/common';
import { CustomersRepository } from './customers.repository';
import { PaginateQuery } from 'nestjs-paginate';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ChargesRepository } from '@/charges/charges.repository';

@Injectable()
export class CustomersService {
  constructor(
    private readonly customersRepository: CustomersRepository,
    private readonly chargesRepository: ChargesRepository,
  ) {}

  async list(
    user: UserRequest,
    paginateQuery: PaginateQuery,
    relations?: string,
  ) {
    return this.customersRepository.list(
      user.id,
      paginateQuery,
      relations.split(/[;,\s]+/).filter(Boolean) || [],
    );
  }

  async findCharges(
    user: UserRequest,
    customerId: string,
    paginateQuery: PaginateQuery,
    relations?: string,
  ) {
    const customer = await this.customersRepository.findOneOrFail(
      {
        correlationID: customerId,
        user: { id: user.id },
      },
      {
        relations: ['user'],
      },
    );

    if (!customer || customer.user.id !== user.id) {
      throw new BadRequestException(
        'CUSTOMER_NOT_FOUND',
        'Customer not found.',
      );
    }

    return this.chargesRepository.listByCustomer(
      user.id,
      customerId,
      paginateQuery,
      relations ? relations.split(/[;,\s]+/).filter(Boolean) : [],
    );
  }

  async create(user: UserRequest, createCustomerDto: CreateCustomerDto) {
    const customerExists = await this.customersRepository.find({
      correlationID: createCustomerDto.correlationID,
      user: { id: user.id },
    });

    if (customerExists.length > 0) {
      throw new BadRequestException(
        'CUSTOMER_ALREADY_EXISTS',
        'Customer already exists.',
      );
    }

    const customers = await this.customersRepository.find({
      user: { id: user.id },
    });

    const customer = await this.customersRepository.create({
      ...createCustomerDto,
      index: customers.length + 1,
      user,
    });

    return customer;
  }

  async update(
    user: UserRequest,
    id: Id,
    updateCustomerDto: UpdateCustomerDto,
  ) {
    const customer = await this.customersRepository.findByIdOrFail(id, {
      relations: ['user'],
    });

    if (!customer || customer.user.id !== user.id) {
      throw new BadRequestException(
        'CUSTOMER_NOT_FOUND',
        'Customer not found.',
      );
    }

    const updatedCustomer = await this.customersRepository.update(
      customer.id,
      updateCustomerDto,
    );

    return updatedCustomer;
  }

  async delete(user: UserRequest, id: Id) {
    const customer = await this.customersRepository.findByIdOrFail(id, {
      relations: ['user'],
    });

    if (!customer || customer.user.id !== user.id) {
      throw new BadRequestException(
        'CUSTOMER_NOT_FOUND',
        'Customer not found.',
      );
    }

    await this.customersRepository.delete(customer.id);

    return { message: 'Customer deleted successfully.' };
  }
}
