import { IsDocument } from '@/helpers/validators/is-document';
import { IsPhone } from '@/helpers/validators/is-phone';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @ApiProperty({
    description: 'Name of the customer',
    example: 'Jane Doe',
    required: true,
  })
  name: string;

  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  @ApiProperty({
    description: 'Email of the customer',
    example: 'john_doe@email.com',
    required: true,
  })
  email: string;

  @IsDocument()
  @Transform(({ value }) => value.replace(/\D/g, ''))
  @ApiProperty({
    description: 'Document of the customer',
    example: '12345678909',
    required: true,
  })
  document: string;

  @IsPhone()
  @IsOptional()
  @Transform(({ value }) => value.replace(/\D/g, ''))
  @ApiProperty({
    description: 'Phone number of the customer',
    example: '5511912345678',
    required: false,
  })
  phone?: string;

  @IsString({ each: true })
  @IsOptional()
  @IsArray()
  @ApiProperty({
    description: 'Tags associated with the customer',
    example: ['vip', 'regular'],
    required: false,
  })
  tags?: string[];
}
