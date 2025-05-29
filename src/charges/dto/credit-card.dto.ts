import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsObject,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreditCardHolderDto } from './credit-card-holder.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreditCardDto {
  @ApiProperty({
    description: 'Credit card token for the transaction',
    example: '1234567890abcdef',
    required: true,
    type: String,
  })
  @IsString()
  token: string;

  @ApiProperty({
    description: 'Number of installments for the payment',
    example: 3,
    required: true,
    type: Number,
  })
  @IsPositive()
  installments: number;

  @ApiProperty({
    description: 'Mask of the credit card.',
    example: '1234********1234',
    required: true,
    type: String,
  })
  @IsString()
  mask: string;

  @ApiProperty({
    description: 'Indicates whether to reuse the token for future transactions',
    example: true,
    required: true,
    type: Boolean,
  })
  @IsBoolean()
  reuseToken: boolean;

  @ApiProperty({
    description: 'Credit card holder information',
    type: () => CreditCardHolderDto,
    required: true,
  })
  @IsObject()
  @IsDefined()
  @Type(() => CreditCardHolderDto)
  @ValidateNested({ each: true })
  holder: CreditCardHolderDto;
}
