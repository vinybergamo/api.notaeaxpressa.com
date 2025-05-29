import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'ID of the plan to subscribe to',
    example: '1',
  })
  @IsString()
  planId: string;

  @ApiProperty({
    description: 'ID of the customer subscribing to the plan',
    example: '1',
  })
  @IsString()
  customerId: string;
}
