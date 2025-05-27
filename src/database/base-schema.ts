import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseSchema {
  @ApiProperty({
    description: 'Unique identifier for the record',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'UUID for the record',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ generated: 'uuid' })
  uuid: string;

  @ApiProperty({
    description: 'Date when the record was created',
    example: new Date(),
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the record was last updated',
    example: new Date(),
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({
    description: 'Date when the record was deleted',
    example: new Date(),
    default: null,
  })
  @DeleteDateColumn()
  deletedAt: Date;
}
