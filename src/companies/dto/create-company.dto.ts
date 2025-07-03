import { IsCNPJ } from '@/helpers/validators/is-cnpj';
import { IsPhone } from '@/helpers/validators/is-phone';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  name: string;

  @IsString()
  fantasyName: string;

  @IsCNPJ()
  document: string;

  @IsEmail()
  @IsOptional()
  email: string;

  @IsPhone()
  @IsOptional()
  phone: string;

  @IsString()
  @IsOptional()
  municipalSubscription?: string;

  @IsString()
  @IsOptional()
  municipalCode?: string;
}
