import { PickType } from '@nestjs/swagger';
import { CreateApplicationDto } from './create-application.dto';

export class RegenerateTokenDto extends PickType(CreateApplicationDto, [
  'tokenExpiresIn',
] as const) {}
