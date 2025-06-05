import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { BaseSchema } from '../../database/base-schema';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { Customer } from '@/customers/entities/customer.entity';
import { User } from '@/users/entities/user.entity';
import * as math from 'mathjs';
import { Subscription } from '@/subscriptions/entities/subscription.entity';
import { GatewayEnum, PaymentMethodsEnum } from '../dto/pay-charge.dto';
import { Exclude } from 'class-transformer';
import { Application } from '@/applications/entities/application.entity';
import { Invoice } from '@/invoices/entities/invoice.entity';

interface Pix {
  method: string;
  txId: string;
  value: number;
  status: string;
  fee: number;
  brCode: string;
  transactionID: string;
  identifier: string;
  qrCodeImage: string;
  key?: string;
  expiresIn?: number;
  expiresAt?: Date;
}

@ApiSchema({
  name: 'ChargeEntity',
  description: 'Entity representing a charge in the system',
})
@Entity()
export class Charge extends BaseSchema {
  @ApiProperty({})
  @Column({ default: 1 })
  index: number;

  @ApiProperty({
    description: 'Unique identifier for the charge',
    example: '12345',
    required: false,
  })
  @Column({ nullable: true })
  correlationID?: string;

  @ApiProperty({
    description: 'Unique identifier for the charge in the payment gateway',
    example: 'gw_12345',
    required: false,
  })
  @Column({ nullable: true })
  gatewayChargeID?: string;

  @ApiProperty({
    description: 'Amount of the charge in cents',
    example: 1000,
  })
  @Column()
  amount: number;

  @ApiProperty({
    description: 'Total amount of the charge in cents, including fees',
    example: 1050,
    required: false,
  })
  @Column({ default: 0 })
  liqAmount: number;

  @ApiProperty({
    description:
      'Total amount of the charge in cents, including fees and additional fees',
    example: 1100,
    required: false,
  })
  @Column({ default: 0 })
  totalAmount: number;

  @ApiProperty({
    description: 'Gateway used for the charge',
    example: 'OPENPIX',
    required: false,
    enum: GatewayEnum,
  })
  @Column({ nullable: true })
  gateway: string;

  @ApiProperty({
    description: 'Fee associated with the charge in cents',
    example: 50,
    required: false,
    default: 0,
  })
  @Column({ default: 0 })
  fee: number;

  @ApiProperty({
    description: 'Additional fee associated with the charge in cents',
    example: 100,
    required: false,
    default: 0,
  })
  @Column({ default: 0 })
  additionalFee: number;

  @ApiProperty({
    description: 'Description of the charge',
    example: 'Payment for service rendered',
    required: false,
  })
  @Column({ nullable: true })
  description?: string;

  @ApiProperty({
    description: 'Status of the charge',
    example: 'PENDING',
    enum: [
      'PENDING',
      'COMPLETED',
      'FAILED',
      'CANCELED',
      'REFUNDED',
      'EXPIRED',
      'PROCESSING',
      'REFUSED',
    ],
    default: 'PENDING',
  })
  @Column({
    type: 'text',
    default: 'PENDING',
  })
  status:
    | 'PENDING'
    | 'COMPLETED'
    | 'FAILED'
    | 'CANCELED'
    | 'REFUNDED'
    | 'EXPIRED'
    | 'PROCESSING'
    | 'REFUSED';

  @ApiProperty({
    description: 'Currency of the charge',
    example: 'BRL',
    required: false,
    default: 'BRL',
  })
  @Column({ default: 'BRL' })
  currency: string;

  @ApiProperty({
    description: 'List of payment methods available for the charge',
    type: String,
    isArray: true,
    enum: PaymentMethodsEnum,
    example: ['CREDIT_CARD', 'PIX', 'BOLETO'],
    required: false,
    default: [],
  })
  @Column({ default: [], type: 'text', array: true })
  methods: PaymentMethodsEnum[];

  @ApiProperty({
    description: 'Payment method used for the charge',
    example: 'CREDIT_CARD',
    required: false,
  })
  @Column({ nullable: true })
  paymentMethod?: string;

  @ApiProperty({
    description: 'URL for the charge, if applicable',
    example: 'https://example.com/charge/12345',
    required: false,
  })
  @Column({ nullable: true })
  url?: string;

  @ApiProperty({
    description: 'Tags associated with the charge',
    type: [String],
    example: ['service', 'payment'],
    required: false,
  })
  @Column({ type: 'text', array: true, default: [] })
  tags: string[];

  @ApiProperty({
    description: 'Expires in seconds, if applicable',
    type: 'number',
    example: 1633072800,
    required: false,
  })
  @Column({ nullable: true })
  expiresIn?: number;

  @ApiProperty({
    description: 'Timestamp when the charge expires, if applicable',
    type: 'string',
    format: 'date-time',
    required: false,
  })
  @Column({ nullable: true })
  expiresAt?: Date;

  @ApiProperty({
    description: 'Timestamp when the charge was paid, if applicable',
    type: 'string',
    format: 'date-time',
    required: false,
  })
  @Column({ nullable: true })
  paidAt?: Date;

  @Column({ nullable: true })
  dueDate?: Date;

  @ApiProperty({
    description: 'Pix payment details, if applicable',
    allOf: [
      {
        type: 'object',
        properties: {
          method: { type: 'string', example: 'PIX_COB' },
          txId: { type: 'string', example: '1234567890' },
          value: { type: 'number', example: 1000 },
          status: { type: 'string', example: 'COMPLETED' },
          fee: { type: 'number', example: 10 },
          brCode: {
            type: 'string',
            example:
              '00020101021126640014BR.GOV.BCB.PIX0114e2eID1234567890123456789012345678905204000053039865404100000000000000000000000000006304A0B1',
          },
          transactionID: { type: 'string', example: '1234567890' },
          identifier: { type: 'string', example: '1234567890' },
          qrCodeImage: {
            type: 'string',
            example: 'https://example.com/qr-code.png',
          },
        },
      },
    ],
    required: false,
  })
  @Column({ type: 'jsonb', nullable: true })
  pix?: Pix;

  @Column({ default: 'NEVER', type: 'varchar' })
  issueInvoice: 'BEFORE_PAYMENT' | 'AFTER_PAYMENT' | 'NEVER';

  @Exclude()
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @ApiProperty({
    description: 'Customer associated with the charge',
    type: () => Customer,
  })
  @ManyToOne(() => Customer, (customer) => customer.charges, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  customer: Customer;

  @ManyToOne(() => User, (user) => user.charges, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => Subscription, (subscription) => subscription.charges, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  subscription: Subscription;

  @ManyToOne(() => Application, {
    nullable: true,
  })
  application: Application;

  @OneToOne(() => Invoice)
  invoice: Invoice;

  @BeforeInsert()
  setDefaults() {
    this.totalAmount = math.add(this.amount, this.additionalFee ?? 0);
    this.liqAmount = math.subtract(this.totalAmount, this.fee ?? 0);
  }

  @BeforeUpdate()
  updateDefaults() {
    this.totalAmount = math.add(this.amount, this.additionalFee ?? 0);
    this.liqAmount = math.subtract(this.totalAmount, this.fee ?? 0);
  }
}
