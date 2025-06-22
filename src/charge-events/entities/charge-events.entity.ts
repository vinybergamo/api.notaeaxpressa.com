import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseSchema } from '../../database/base-schema';
import { Charge } from '@/charges/entities/charge.entity';
import { User } from '@/users/entities/user.entity';
import { Company } from '@/companies/entities/company.entity';
import { Customer } from '@/customers/entities/customer.entity';

@Entity()
export class ChargeEvents extends BaseSchema {
  @Column({ default: 1 })
  index: number;

  @Column({ type: 'jsonb', nullable: true })
  data: Charge;

  @Column()
  type: string;

  @ManyToOne(() => Charge, (charge) => charge.events, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  charge: Charge;

  @ManyToOne(() => Company)
  company: Company;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Customer)
  customer: Customer;
}
