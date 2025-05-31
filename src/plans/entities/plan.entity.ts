import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseSchema } from '../../database/base-schema';
import { Subscription } from '@/subscriptions/entities/subscription.entity';
import { PaymentMethodsEnum } from '@/charges/dto/pay-charge.dto';
import { User } from '@/users/entities/user.entity';

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

  @Column({ type: 'text', array: true, default: [] })
  paymentMethods: PaymentMethodsEnum[];

  @Column({ default: false })
  isActive: boolean;

  @OneToMany(() => Subscription, (subscription) => subscription.plan, {
    cascade: true,
  })
  subscriptions: Subscription[];

  @ManyToOne(() => User, (user) => user.plans, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  user: User;
}
