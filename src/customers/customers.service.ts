import { BadRequestException, Injectable } from '@nestjs/common';
import { CustomersRepository } from './customers.repository';
import { PaginateQuery } from 'nestjs-paginate';
import { ILike } from 'typeorm';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly customersRepository: CustomersRepository) {}

  async list(
    user: UserRequest,
    paginateQuery: PaginateQuery,
    relations?: string,
  ) {
    return this.customersRepository.list(
      user.id,
      paginateQuery,
      relations.split(';'),
    );
  }

  async create(user: UserRequest, createCustomerDto: CreateCustomerDto) {
    const customerExists = await this.customersRepository.find([
      {
        email: ILike(`%${createCustomerDto.email}%`),
        user: { id: user.id },
      },
      {
        document: ILike(`%${createCustomerDto.document}%`),
        user: { id: user.id },
      },
    ]);

    if (customerExists.length > 0) {
      throw new BadRequestException(
        'CUSTOMER_ALREADY_EXISTS',
        'Customer already exists.',
      );
    }

    const customer = await this.customersRepository.create({
      ...createCustomerDto,
      user: { id: user.id },
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
