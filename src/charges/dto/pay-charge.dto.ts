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

export enum GatewayEnum {
  OPENPIX = 'OPENPIX',
}

export enum PaymentMethodsEnum {
  PIX = 'PIX',
  CREDIT_CARD = 'CREDIT_CARD',
}

export class PayChargeDto {
  @ApiProperty({
    description: 'Gateway to be used for the charge',
    example: 'OPENPIX',
    required: true,
    type: String,
    enum: GatewayEnum,
  })
  @IsString()
  @IsEnum(GatewayEnum)
  @Transform(({ value }: { value: string }) => value.toUpperCase())
  gateway: string;

  @ApiProperty({
    description: 'Payment method to be used for the charge',
    example: 'PIX',
    required: true,
    type: String,
    enum: PaymentMethodsEnum,
  })
  @IsString()
  @IsEnum(PaymentMethodsEnum)
  @Transform(({ value }: { value: string }) => value.toUpperCase())
  paymentMethod: PaymentMethodsEnum;

  @ApiProperty({
    description: 'Credit card details if payment method is CREDIT_CARD',
    type: () => CreditCardDto,
    required: false,
  })
  @IsObject()
  @IsDefined()
  @Type(() => CreditCardDto)
  @ValidateNested({ each: true })
  @ValidateIf((o) => o.paymentMethod === PaymentMethodsEnum.CREDIT_CARD)
  creditCard: CreditCardDto;
}
