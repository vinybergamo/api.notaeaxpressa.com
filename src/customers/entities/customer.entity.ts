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
import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { User } from '@/users/entities/user.entity';
import phone from 'phone';
import { isCNPJ, isCPF, isDocument } from '@/utils/is-document';
import { Charge } from '@/charges/entities/charge.entity';
import { Project } from '@/projects/entities/project.entity';
import { Subscription } from '@/subscriptions/entities/subscription.entity';

@ApiSchema({
  name: 'CustomerEntity',
})
@Entity()
export class Customer extends BaseSchema {
  @Column({ default: 1 })
  index: number;

  @Column({ nullable: true })
  correlationID: string;

  @ApiProperty({
    description: 'Name of the customer',
    example: 'Jane Doe',
  })
  @Column()
  name: string;

  @ApiProperty({
    description: 'Email of the customer',
    example: 'john_doe@email.com',
  })
  @Column({ unique: true })
  email: string;

  @ApiProperty({
    description: 'Document of the customer',
    example: '12345678909',
  })
  @Column()
  document: string;

  @ApiProperty({
    description: 'Type of the document',
    example: 'BR:CPF',
  })
  @Column({ default: 'BR:CPF' })
  documentType: string;

  @ApiProperty({
    description: 'Phone number of the customer',
    example: '5511912345678',
  })
  @Column({ nullable: true })
  phone: string;

  @ApiProperty({
    description: 'Coutry Code of the customer phone number',
    example: 'BR:+55',
  })
  @Column({ nullable: true })
  countryCode: string;

  @ApiProperty({
    description: 'Tags associated with the customer',
    example: ['VIP', 'Newsletter'],
  })
  @Column({ nullable: true, default: null, type: 'text', array: true })
  tags: string[];

  @ApiProperty({
    description: 'Avatar of the customer',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @Column({ nullable: true })
  avatar: string;

  @OneToMany(() => Charge, (charge) => charge.customer, {
    cascade: true,
  })
  @ApiProperty({
    description: 'Charges associated with the customer',
    type: () => [Charge],
    required: false,
  })
  charges: Charge[];

  @ManyToOne(() => User, (user) => user.id, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @ApiProperty({
    description: 'User associated with the customer',
    example: User,
    type: () => User,
  })
  user: User;

  @ApiProperty({
    description: 'Projects associated with the customer',
    type: () => [Project],
    required: false,
  })
  @OneToMany(() => Project, (project) => project.customer, {
    cascade: true,
    nullable: true,
  })
  projects: Project[];

  @ApiProperty({
    description: 'Subscriptions associated with the customer',
    type: () => [Subscription],
    required: false,
  })
  @OneToMany(() => Subscription, (subscription) => subscription.customer, {
    cascade: true,
    nullable: true,
  })
  subscriptions: Subscription[];

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
