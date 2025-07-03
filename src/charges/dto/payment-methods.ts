import { IsOptional, IsPositive, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class PaymentMethodDto {
  @IsString()
  gateway: string;

  @IsString()
  @Transform(({ value }: { value: string }) => value.toUpperCase())
  method: string;

  @IsPositive()
  @IsOptional()
  priority?: number;
}
