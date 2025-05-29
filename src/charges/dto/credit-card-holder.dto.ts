import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNumberString, IsOptional, IsString } from 'class-validator';

export class CreditCardHolderDto {
  @ApiProperty({
    description: 'Name of the credit card holder',
    example: 'John Doe',
    required: true,
    type: String,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Document type of the credit card holder',
    example: '12345678909',
    required: true,
    type: String,
  })
  @IsNumberString()
  @Transform(({ value }) => value.replace(/\D/g, ''))
  document: string;

  @ApiProperty({
    description: 'Phone number of the credit card holder',
    example: '5511999999999',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Email of the credit card holder',
    example: 'john_doe@email.com',
    required: false,
    type: String,
  })
  @IsEmail()
  @IsOptional()
  email?: string;
}
