import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseSchema } from '../../database/base-schema';
import { Subscription } from '@/subscriptions/entities/subscription.entity';
import { PaymentMethodsEnum } from '@/charges/dto/pay-charge.dto';
import { User } from '@/users/entities/user.entity';
import { Application } from '@/applications/entities/application.entity';
import { Company } from '@/companies/entities/company.entity';

@Entity()
export class Plan extends BaseSchema {
  @Column({ default: 1 })
  index: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  price: number;

  @Column({ default: 0 })
  fee: number;

  @Column({ default: 'BRL' })
  currency: string;

  @Column({ default: 'MONTH' })
  interval: string;

  @Column({ default: 1 })
  intervalCount: number;

  @Column({ default: 0 })
  trialDays: number;

  @Column({ type: 'text', array: true, default: [] })
  tags: string[];

  @Column({
    default: [
      {
        gateway: 'OPENPIX',
        method: PaymentMethodsEnum.PIX,
        priority: 1,
      },
    ],
    type: 'jsonb',
  })
  paymentMethods: {
    gateway: string;
    method: string;
    priority?: number;
  }[];

  @Column({ default: 'NEVER', type: 'varchar' })
  issueInvoice: 'BEFORE_PAYMENT' | 'AFTER_PAYMENT' | 'NEVER';

  @Column({ default: false })
  isActive: boolean;

  @OneToMany(() => Subscription, (subscription) => subscription.plan, {
    cascade: true,
  })
  subscriptions: Subscription[];

  @ManyToOne(() => Company, (company) => company.plans, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  company: Company;

  @ManyToOne(() => User, (user) => user.plans, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  user: User;

  @ManyToOne(() => Application, {
    nullable: true,
  })
  application: Application;
}
