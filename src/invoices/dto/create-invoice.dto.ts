import { Transform } from 'class-transformer';
import { IsDate, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateInvoiceDto {
  @IsDate()
  @Transform(({ value }) => new Date(value))
  issueDate: Date;

  @IsInt()
  @Transform(({ value }) => {
    if (typeof value !== 'number') {
      if (isNaN(value)) {
        return 0;
      }

      return parseInt(value, 10);
    }

    return value;
  })
  amount: number;

  @IsString()
  companyId: string;

  @IsString()
  @IsOptional()
  chargeId: string;

  @IsString()
  @IsOptional()
  customerId: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  serviceCode: string;
}
