import { Body, Controller, Query } from '@nestjs/common';
import { ChargesService } from './charges.service';
import { Endpoint } from '@/helpers/decorators/endpoint.decorator';
import { CreateOneStepChargeDto } from './dto/create-one-step-charge.dto';
import { Me } from '@/helpers/decorators/me.decorator';
import { Charge } from './entities/charge.entity';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { buildPaginatedDocs } from '@/utils/build-paginated-docs';

@Controller('charges')
export class ChargesController {
  constructor(private readonly chargesService: ChargesService) {}

  @Endpoint({
    method: 'GET',
    documentation: {
      extraModels: [Charge],
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
      summary: 'List all charges',
      description:
        'Retrieve a paginated list of all charges associated with the authenticated user.',
      responses: {
        200: {
          description: 'List of charges',
          content: {
            'application/json': buildPaginatedDocs(Charge, 'charges'),
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
    return this.chargesService.list(me, paginate, relations || '');
  }

  @Endpoint({
    method: 'POST',
    path: 'one-step',
    documentation: {
      summary: 'Create a one-step charge',
      responses: {
        201: {
          description: 'Charge created successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ChargeEntity',
              },
            },
          },
        },
      },
    },
  })
  create(
    @Me() me: UserRequest,
    @Body() createChargeDto: CreateOneStepChargeDto,
  ) {
    return this.chargesService.createOneStep(me, createChargeDto);
  }
}
