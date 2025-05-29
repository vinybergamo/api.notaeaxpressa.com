import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';
import { PayChargeDto } from './pay-charge.dto';

export class CreateOneStepChargeDto extends PayChargeDto {
  @ApiProperty({
    description: 'ID of the customer associated with the charge',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  customerId: string;

  @ApiProperty({
    description:
      'Additional fee for the charge in cents, must be a positive integer',
    example: 100,
    required: false,
    type: Number,
  })
  @IsInt()
  @IsOptional()
  @Transform(({ value }: { value: number }) => {
    if (value < 0) {
      return 0;
    }

    return value;
  })
  additionalFee: number;

  @ApiProperty({
    description: 'Amount of the charge in cents, must be a positive integer',
    example: 5000,
    required: true,
    type: Number,
  })
  @IsPositive()
  amount: number;

  @ApiProperty({
    description: 'Description of the charge',
    example: 'Payment for service XYZ',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({
    description: 'Due date for the charge in ISO format',
    example: '2023-10-31T23:59:59.999Z',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  dueDate: string;

  @ApiProperty({
    description: 'Expiration time for the charge in seconds',
    example: 3600,
    required: false,
    type: Number,
  })
  @IsPositive()
  @IsOptional()
  expiresIn: number;
}
