import { IsEnum, IsOptional, IsPositive, IsString } from 'class-validator';
import { GatewayEnum, PaymentMethodsEnum } from './pay-charge.dto';
import { Transform } from 'class-transformer';

export class PaymentMethodDto {
  @IsString()
  @IsEnum(GatewayEnum)
  @Transform(({ value }: { value: string }) => value.toUpperCase())
  gateway: string;

  @IsString()
  @IsEnum(PaymentMethodsEnum)
  @Transform(({ value }: { value: string }) => value.toUpperCase())
  method: string;

  @IsPositive()
  @IsOptional()
  priority?: number;
}
