import { Column, Entity, OneToOne } from 'typeorm';
import { BaseSchema } from '../../database/base-schema';
import { Charge } from '@/charges/entities/charge.entity';

@Entity()
export class Invoice extends BaseSchema {
  @Column()
  issueDate: Date;

  @OneToOne(() => Charge)
  charge: Charge;
}
