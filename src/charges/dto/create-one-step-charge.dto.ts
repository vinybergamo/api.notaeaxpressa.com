import { IntersectionType } from '@nestjs/swagger';
import { PayChargeDto } from './pay-charge.dto';
import { CreateChargeDto } from './create-charge.dto';
import { IsString } from 'class-validator';

export class CreateOneStepChargeDto extends IntersectionType(
  CreateChargeDto,
  PayChargeDto,
) {
  @IsString()
  gateway: string;
}
