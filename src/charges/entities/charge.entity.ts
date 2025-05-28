import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseSchema } from '../../database/base-schema';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { Customer } from '@/customers/entities/customer.entity';
import { User } from '@/users/entities/user.entity';

interface Pix {
  e2eID?: string;
  method: string;
  txId: string;
  value: number;
  status: string;
  fee: number;
  brCode: string;
  transactionID: string;
  identifier: string;
  qrCodeImage: string;
}

@ApiSchema({
  name: 'ChargeEntity',
  description: 'Entity representing a charge in the system',
})
@Entity()
export class Charge extends BaseSchema {
  @ApiProperty({
    description: 'Unique identifier for the charge',
    example: '12345',
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
    description: 'Gateway used for the charge',
    example: 'OPENPIX',
  })
  @Column()
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
    type: [String],
    example: ['CREDIT_CARD', 'PIX', 'BOLETO'],
    required: false,
    default: [],
  })
  @Column({ default: [], type: 'text', array: true })
  methods: string[];

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
    description: 'Timestamp when the charge was created',
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

  @ApiProperty({
    description: 'Pix payment details, if applicable',
    type: 'object',
    additionalProperties: true,
  })
  @Column({ type: 'jsonb', nullable: true })
  pix?: Pix;

  @ApiProperty({
    description: 'Metadata associated with the charge',
    type: 'object',
    additionalProperties: true,
  })
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
}
