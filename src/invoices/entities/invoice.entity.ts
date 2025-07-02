import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { BaseSchema } from '../../database/base-schema';
import { Charge } from '@/charges/entities/charge.entity';
import { Company } from '@/companies/entities/company.entity';
import { Customer } from '@/customers/entities/customer.entity';

@Entity()
export class Invoice extends BaseSchema {
  @Column({ default: 1 })
  index: number;

  @Column({ type: 'varchar' })
  correlationId: string;

  @Column({ default: 0 })
  amount: number;

  @Column({ nullable: true })
  description: string;

  @Column()
  issueDate: Date;

  @Column({ default: '1402' })
  serviceCode: string;

  @Column({ nullable: true })
  rpsNumber?: string;

  @Column({ nullable: true })
  rpsSeries?: string;

  @Column({ nullable: true })
  rpsType?: string;

  @Column({ default: 'PENDING' })
  status: string;

  @Column({ nullable: true })
  url: string;

  @Column({ nullable: true })
  xmlPath: string;

  @Column({ nullable: true })
  danfseUlr: string;

  @Column({ nullable: true })
  nfseNumber: string;

  @Column({ nullable: true })
  verificationCode: string;

  @Column({ nullable: true, type: 'jsonb' })
  metadata: any;

  @JoinColumn()
  @OneToOne(() => Charge)
  charge: Charge;

  @ManyToOne(() => Company)
  company: Company;

  @ManyToOne(() => Customer)
  customer: Customer;
}
