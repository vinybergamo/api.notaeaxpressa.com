import { PayChargeDto } from './dto/pay-charge.dto';
import { Charge } from './entities/charge.entity';

export interface GatewayFactory {
  process(charge: Charge, dto: PayChargeDto): Promise<Charge>;
}
