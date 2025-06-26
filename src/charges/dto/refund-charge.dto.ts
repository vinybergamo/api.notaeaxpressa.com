import { IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class RefundChargeDto {
  @IsPositive()
  amount: number;

  @IsString()
  @IsOptional()
  @MaxLength(140)
  comment: string;
}
