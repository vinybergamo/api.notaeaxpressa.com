import { Column, Entity, OneToMany } from 'typeorm';
import { BaseSchema } from '../../database/base-schema';
import { Subscription } from '@/subscriptions/entities/subscription.entity';

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

  @Column({ default: 'BRL' })
  currency: string;

  @Column({ default: 'MONTH' })
  interval: string;

  @Column({ default: 1 })
  intervalCount: number;

  @Column({ default: 0 })
  trialDays: number;

  @Column({ type: 'text', array: true, default: [] })
  paymentMethods: string[];

  @Column({ default: false })
  isActive: boolean;

  @OneToMany(() => Subscription, (subscription) => subscription.plan, {
    cascade: true,
  })
  subscriptions: Subscription[];
}
