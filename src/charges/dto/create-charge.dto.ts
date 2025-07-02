import { ApiProperty, PickType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDate,
  IsDefined,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Validate,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { PaymentMethodDto } from './payment-methods';
import { PriorityRequiredIfDuplicateMethodConstraint } from '@/helpers/validators/priority-required-if-payment-method-is-duplicate';
import { CreateInvoiceDto } from '@/invoices/dto/create-invoice.dto';

enum IssueInvoiceEnum {
  BEFORE = 'BEFORE_PAYMENT',
  AFTER = 'AFTER_PAYMENT',
  NEVER = 'NEVER',
}

class InvoiceDto extends PickType(CreateInvoiceDto, ['serviceCode'] as const) {}

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

  @IsString()
  companyId: string;

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
  @ArrayMinSize(1, {
    message: 'At least one paymentMethod must be specified',
  })
  @ValidateNested({ each: true })
  @Type(() => PaymentMethodDto)
  @IsDefined()
  @Validate(PriorityRequiredIfDuplicateMethodConstraint)
  @Transform(({ value }: { value: PaymentMethodDto[] }) => {
    const uniqueMethods = new Map();
    value.forEach((method) => {
      const key = `${method.gateway}-${method.method}`;
      if (!uniqueMethods.has(key)) {
        uniqueMethods.set(key, method);
      }
    });

    return Array.from(uniqueMethods.values());
  })
  paymentMethods: PaymentMethodDto[];

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

  @ValidateIf(
    (o: CreateChargeDto) =>
      o.issueInvoice === IssueInvoiceEnum.AFTER ||
      o.issueInvoice === IssueInvoiceEnum.BEFORE,
  )
  @IsDefined()
  @ValidateNested({ each: true })
  @Type(() => InvoiceDto)
  invoice: InvoiceDto;
}
