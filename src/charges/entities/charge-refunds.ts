import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseSchema } from '../../database/base-schema';
import { Charge } from './charge.entity';

@Entity()
export class ChargeRefunds extends BaseSchema {
  @Column()
  correlationID: string;

  @Column({ nullable: true })
  gatewayId: string;

  @Column({ nullable: true })
  refundId: string;

  @Column({ default: 0 })
  amount: number;

  @Column({ default: 'PROCESSING' })
  status: string;

  @Column({ nullable: true })
  comment: string;

  @Column({ nullable: true })
  refundedAt: Date;

  @Column({ nullable: true, type: 'jsonb' })
  metadata: any;

  @ManyToOne(() => Charge, (charge) => charge.refunds, {
    onDelete: 'CASCADE',
    eager: true,
  })
  charge: Charge;
}
