import { Charge } from './entities/charge.entity';

export interface GatewayFactory {
  create(charge: Charge): Promise<Charge>;
}
