import { CreateChargeDto } from '@/charges/dto/create-charge.dto';
import { PickType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
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

export class CreatePlanDto extends PickType(CreateChargeDto, [
  'paymentMethods',
  'issueInvoice',
] as const) {
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

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
