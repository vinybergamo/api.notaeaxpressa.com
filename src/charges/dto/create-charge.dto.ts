import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

enum IssueInvoiceEnum {
  BEFORE = 'BEFORE_PAYMENT',
  AFTER = 'AFTER_PAYMENT',
  NEVER = 'NEVER',
}

export class CreateChargeDto {
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

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({
    description: 'List of payment methods for the charge',
    example: ['PIX', 'CREDIT_CARD'],
    required: false,
    type: [String],
  })
  @MinLength(1, {
    message: 'At least one payment method must be specified',
  })
  paymentMethods: string[];

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
  @IsDate()
  @IsOptional()
  @Transform(({ value }: { value: string }) => {
    if (value) {
      return new Date(value);
    }
    return null;
  })
  dueDate: Date;

  @ApiProperty({
    description: 'Expiration time for the charge in seconds',
    example: 3600,
    required: false,
    type: Number,
  })
  @IsPositive()
  @IsOptional()
  expiresIn: number;

  @ApiProperty({
    description: 'List of tags associated with the charge',
    example: ['service', 'payment'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags: string[];

  @ApiProperty({
    description: 'Issue invoice policy for the charge',
    enum: IssueInvoiceEnum,
    example: IssueInvoiceEnum.AFTER,
    required: false,
  })
  @IsOptional()
  @IsEnum(IssueInvoiceEnum)
  issueInvoice: IssueInvoiceEnum;
}
