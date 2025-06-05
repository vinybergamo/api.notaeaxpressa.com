import { Body, Controller, Param, Query, Req } from '@nestjs/common';
import { ChargesService } from './charges.service';
import { Endpoint } from '@/helpers/decorators/endpoint.decorator';
import { CreateOneStepChargeDto } from './dto/create-one-step-charge.dto';
import { Me } from '@/helpers/decorators/me.decorator';
import { Charge } from './entities/charge.entity';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { buildPaginatedDocs } from '@/utils/build-paginated-docs';
import { PayChargeDto } from './dto/pay-charge.dto';
import { Request } from 'express';
import { CreateChargeDto } from './dto/create-charge.dto';

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
    method: 'GET',
    path: ':uuid/public',
    isPublic: true,
    documentation: {
      summary: 'Get public charge by UUID',
      description:
        'Retrieve a charge by its UUID. This endpoint is public and does not require authentication.',
      params: [
        {
          name: 'uuid',
          required: true,
          description: 'UUID of the charge to retrieve',
          schema: {
            type: 'string',
            format: 'uuid',
            example: '550e8400-e29b-41d4-a716-446655440000',
          },
        },
      ],
      responses: {
        200: {
          description: 'Charge retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ChargeEntity',
              },
            },
          },
        },
        404: {
          description: 'Charge not found',
        },
      },
    },
  })
  getPublicCharge(@Param('uuid') uuid: string) {
    return this.chargesService.getPublicCharge(uuid);
  }

  @Endpoint({
    method: 'POST',
  })
  create(
    @Me() me: UserRequest,
    @Body() createChargeDto: CreateChargeDto,
    @Req() req: Request,
  ) {
    return this.chargesService.createCharge(
      me,
      createChargeDto,
      req.application,
    );
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
  createOneStep(
    @Me() me: UserRequest,
    @Body() createChargeDto: CreateOneStepChargeDto,
    @Req() req: Request,
  ) {
    return this.chargesService.createOneStep(
      me,
      createChargeDto,
      req.application,
    );
  }

  @Endpoint({
    method: 'POST',
    path: ':chargeId/pay',
    isPublic: true,
    documentation: {
      summary: 'Pay a charge',
      description:
        'Process a payment for a specific charge using the specified gateway.',
      params: [
        {
          name: 'chargeId',
          required: true,
          description: 'ID of the charge to pay',
          schema: {
            type: 'string',
            format: 'uuid or integer',
            examples: {
              uuid: {
                value: '550e8400-e29b-41d4-a716-446655440000',
                description: 'Example UUID charge ID',
              },
              integer: {
                value: '123456',
                description: 'Example integer charge ID',
              },
            },
          },
        },
      ],
      responses: {
        200: {
          description: 'Charge paid successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ChargeEntity',
              },
            },
          },
        },
        400: {
          description: 'Bad Request - Invalid payment method or gateway',
        },
      },
    },
  })
  pay(@Body() payChargeDto: PayChargeDto, @Param('chargeId') chargeId: Id) {
    return this.chargesService.pay(chargeId, payChargeDto);
  }
}
