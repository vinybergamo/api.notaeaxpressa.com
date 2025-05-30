import { IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  name: string;

  @IsPositive()
  @IsOptional()
  tokenExpiresIn: number;
}
