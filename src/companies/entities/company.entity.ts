import {
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseSchema } from '../../database/base-schema';
import { User } from '@/users/entities/user.entity';
import { isCNPJ, isCPF, isDocument } from '@/utils/is-document';
import phone from 'phone';
import { Charge } from '@/charges/entities/charge.entity';
import { Subscription } from '@/subscriptions/entities/subscription.entity';
import { Plan } from '@/plans/entities/plan.entity';

@Entity()
export class Company extends BaseSchema {
  @Column({ default: 1 })
  index: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  fantasyName?: string;

  @Column()
  document: string;

  @Column({ default: 'BR:CNPJ' })
  documentType: string;

  @Column({ default: 'BRL' })
  currency: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  countryCode: string;

  @Column({ nullable: true })
  municipalRegistration: string;

  @Column({ nullable: true })
  cityCode: string;

  @Column({ default: false })
  isDefault: boolean;

  @Column({ nullable: true })
  defaultInvoiceTaxCode: string;

  @Column({ nullable: true })
  defaultInvoiceRate: number;

  @Column({ nullable: true })
  defaultInvoiceSimpleNationalOptIn: boolean;

  @Column({ nullable: true })
  defaultInvoiceOperationType: number;

  @Column({ nullable: true })
  defaultInvoiceWithheldISS: boolean;

  @Column({ nullable: true })
  defaultInvoiceServiceListItem: string;

  @ManyToOne(() => User, (user) => user.companies, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  user: User;

  getPhoneCoutryCode() {
    const { isValid, countryCode, countryIso2 } = phone(`+${this.phone}`);

    if (!isValid) {
      this.phone = null;
      this.countryCode = null;
      return null;
    }

    this.countryCode = `${countryIso2}:${countryCode}`;

    return this.countryCode;
  }

  getDocumentType() {
    if (!this.document) {
      this.documentType = null;
      return null;
    }

    if (isDocument(this.document)) {
      if (isCPF(this.document)) {
        this.documentType = 'BR:CPF';
      }

      if (isCNPJ(this.document)) {
        this.documentType = 'BR:CNPJ';
      }

      return this.documentType;
    }

    this.documentType = 'UNKNOWN:UNKNOWN';
    return this.documentType;
  }

  @OneToMany(() => Subscription, (subscription) => subscription.company, {
    cascade: true,
  })
  subscriptions: Subscription[];

  @OneToMany(() => Plan, (plan) => plan.company, {
    cascade: true,
  })
  plans: Plan[];

  @OneToMany(() => Charge, (charge) => charge.company, {
    cascade: true,
  })
  charges: Charge[];

  @BeforeInsert()
  beforeInsertActions() {
    this.getPhoneCoutryCode();
    this.getDocumentType();
  }

  @BeforeUpdate()
  beforeUpdateActions() {
    this.getPhoneCoutryCode();
    this.getDocumentType();
  }

  @AfterLoad()
  afterLoadActions() {
    this.getPhoneCoutryCode();
    this.getDocumentType();
  }
}
