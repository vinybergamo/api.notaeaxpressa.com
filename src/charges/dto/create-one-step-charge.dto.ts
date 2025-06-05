import { IntersectionType } from '@nestjs/swagger';
import { PayChargeDto } from './pay-charge.dto';
import { CreateChargeDto } from './create-charge.dto';

export class CreateOneStepChargeDto extends IntersectionType(
  CreateChargeDto,
  PayChargeDto,
) {}
