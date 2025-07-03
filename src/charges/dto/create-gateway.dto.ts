import { Transform } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

enum GatewayBankEnum {
  OPENPIX = 'OPENPIX',
}

export class CreateGatewayDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  companyId: string;

  @IsString()
  @IsEnum(GatewayBankEnum)
  bank: GatewayBankEnum;

  @IsString()
  @ValidateIf((o) => o.bank === GatewayBankEnum.OPENPIX)
  clientId: string;

  @IsString()
  @ValidateIf((o) => o.bank === GatewayBankEnum.OPENPIX)
  clientSecret: string;

  @IsString()
  @IsOptional()
  correlationID: string;

  @IsBoolean()
  @IsOptional()
  isSandbox: boolean = false;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @Transform(({ value }: { value: string[] }) =>
    value.map((v) => v.trim().toUpperCase()),
  )
  paymentMethods;
}
