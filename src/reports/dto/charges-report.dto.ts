import { Transform } from 'class-transformer';
import { IsBoolean, IsDate, IsNotEmpty, IsOptional } from 'class-validator';

export class GetChargesReportDto {
  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  start: Date;

  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  end: Date;

  @IsBoolean()
  @IsOptional()
  @Transform(
    ({ value }) =>
      value === 'true' || value === true || value === 1 || value === '1',
  )
  includeCharges: boolean;
}
