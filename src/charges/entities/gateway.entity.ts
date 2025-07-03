import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseSchema } from '../../database/base-schema';
import { Company } from '@/companies/entities/company.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class Gateway extends BaseSchema {
  @Column({ default: 1 })
  index: number;

  @Column({ nullable: true })
  correlationID: string;

  @Column()
  bank: string;

  @Column({ nullable: true })
  clientId: string;

  @Exclude()
  @Column({ nullable: true })
  clientSecret: string;

  @Column({ default: false })
  isSandbox: boolean;

  @Column({ default: [], type: 'text', array: true })
  paymentMethods: string[];

  @ManyToOne(() => Company)
  company: Company;
}
