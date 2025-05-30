import { PaymentMethodsEnum } from '@/charges/dto/pay-charge.dto';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

enum PlanIntervalEnum {
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  YEAR = 'YEAR',
}

export class CreatePlanDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsPositive()
  price: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsEnum(PlanIntervalEnum)
  @Transform(({ value }) => value.toUpperCase())
  interval: string;

  @Min(1)
  @IsPositive()
  intervalCount?: number;

  @IsPositive()
  @IsOptional()
  trialDays?: number;

  @IsArray()
  @IsEnum(PaymentMethodsEnum, { each: true })
  paymentMethods: PaymentMethodsEnum[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
