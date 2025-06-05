import { Body, Controller, Param, Query } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { Endpoint } from '@/helpers/decorators/endpoint.decorator';
import { Customer } from './entities/customer.entity';
import { buildPaginatedDocs } from '@/utils/build-paginated-docs';
import { Me } from '@/helpers/decorators/me.decorator';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Endpoint({
    method: 'GET',
    documentation: {
      extraModels: [Customer],
      summary: 'List all customers',
      query: [
        {
          name: 'relations',
          description:
            'Semicolon-Separated list of relations to include in the response',
          required: false,
          schema: {
            type: 'string',
            example: 'customer;subscription',
          },
        },
      ],
      responses: {
        200: {
          description: 'List of customers',
          content: {
            'application/json': buildPaginatedDocs(Customer, 'customers'),
          },
        },
      },
    },
  })
  list(
    @Me() me: UserRequest,
    @Paginate() paginate: PaginateQuery,
    @Query('relations') relations: string,
  ) {
    return this.customersService.list(me, paginate, relations || '');
  }

  @Endpoint({
    method: 'GET',
    path: ':id/charges',
  })
  findCharges(
    @Me() me: UserRequest,
    @Param('id') id: string,
    @Paginate() paginate: PaginateQuery,
    @Query('relations') relations: string,
  ) {
    return this.customersService.findCharges(me, id, paginate, relations || '');
  }

  @Endpoint({
    method: 'POST',
  })
  create(@Me() me: UserRequest, @Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(me, createCustomerDto);
  }

  @Endpoint({
    method: 'PUT',
    path: ':id',
    documentation: {
      summary: 'Update a customer',
      responses: {
        200: {
          description: 'Customer updated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CustomerEntity',
              },
            },
          },
        },
      },
    },
  })
  update(
    @Me() me: UserRequest,
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.update(me, id, updateCustomerDto);
  }

  @Endpoint({
    method: 'DELETE',
    path: ':id',
    documentation: {
      summary: 'Delete a customer',
      responses: {
        200: {
          description: 'Customer deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Customer deleted successfully',
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  delete(@Me() me: UserRequest, @Param('id') id: string) {
    return this.customersService.delete(me, id);
  }
}
