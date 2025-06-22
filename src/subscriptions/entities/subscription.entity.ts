import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseSchema } from '../../database/base-schema';
import { User } from '@/users/entities/user.entity';
import { Customer } from '@/customers/entities/customer.entity';
import { Charge } from '@/charges/entities/charge.entity';
import { Plan } from '@/plans/entities/plan.entity';
import { Application } from '@/applications/entities/application.entity';
import { Company } from '@/companies/entities/company.entity';

@Entity()
export class Subscription extends BaseSchema {
  @Column({ default: 1 })
  index: number;

  @Column()
  startDate: Date;

  @Column()
  nextBillingDate: Date;

  @Column({ nullable: true })
  lastBillingDate: Date;

  @Column({ default: 'ACTIVE' })
  status: string;

  @Column({ default: false })
  isTrial: boolean;

  @Column({ nullable: true })
  endDate: Date;

  @ManyToOne(() => User, (user) => user.subscriptions, {
    onUpdate: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => Company, (company) => company.subscriptions, {
    onUpdate: 'CASCADE',
  })
  company: Company;

  @ManyToOne(() => Plan, (plan) => plan.subscriptions)
  plan: Plan;

  @ManyToOne(() => Customer, (customer) => customer.subscriptions, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  customer: Customer;

  @OneToMany(() => Charge, (charge) => charge.subscription, {
    cascade: true,
  })
  charges: Charge[];

  @ManyToOne(() => Application, {
    nullable: true,
  })
  application: Application;
}
