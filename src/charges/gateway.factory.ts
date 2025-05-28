import { Charge } from './entities/charge.entity';

export interface GatewayFactory {
  process(charge: Charge): Promise<Charge>;
}
