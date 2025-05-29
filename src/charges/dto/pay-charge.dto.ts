import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDefined,
  IsEnum,
  IsObject,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { CreditCardDto } from './credit-card.dto';

export enum Gateway {
  OPENPIX = 'OPENPIX',
}

export enum PaymentMethods {
  PIX = 'PIX',
  CREDIT_CARD = 'CREDIT_CARD',
}

export class PayChargeDto {
  @ApiProperty({
    description: 'Gateway to be used for the charge',
    example: 'OPENPIX',
    required: true,
    type: String,
    enum: Gateway,
  })
  @IsString()
  @IsEnum(Gateway)
  @Transform(({ value }: { value: string }) => value.toUpperCase())
  gateway: string;

  @ApiProperty({
    description: 'Payment method to be used for the charge',
    example: 'PIX',
    required: true,
    type: String,
    enum: PaymentMethods,
  })
  @IsString()
  @IsEnum(PaymentMethods)
  @Transform(({ value }: { value: string }) => value.toUpperCase())
  paymentMethod: string;

  @ApiProperty({
    description: 'Credit card details if payment method is CREDIT_CARD',
    type: () => CreditCardDto,
    required: false,
  })
  @IsObject()
  @IsDefined()
  @Type(() => CreditCardDto)
  @ValidateNested({ each: true })
  @ValidateIf((o) => o.paymentMethod === PaymentMethods.CREDIT_CARD)
  creditCard: CreditCardDto;
}
