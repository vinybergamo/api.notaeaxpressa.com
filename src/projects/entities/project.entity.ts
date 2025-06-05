import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseSchema } from '../../database/base-schema';
import { User } from '@/users/entities/user.entity';
import { Customer } from '@/customers/entities/customer.entity';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { Application } from '@/applications/entities/application.entity';

@ApiSchema({
  name: 'ProjectEntity',
})
@Entity()
export class Project extends BaseSchema {
  @ApiProperty({
    description: 'Index of the project',
    example: 1,
    default: 'Auto-generated',
    type: Number,
  })
  @Column({ default: 1 })
  index: number;

  @ApiProperty({
    description: 'Name of the project',
    example: 'Project Alpha',
    type: String,
  })
  @Column()
  name: string;

  @ApiProperty({
    description: 'Description of the project',
    example: 'This is a sample project description.',
    type: String,
    required: false,
  })
  @Column({ nullable: true })
  description: string;

  @ApiProperty({
    description: 'Status of the project',
    example: 'ACTIVE',
    default: 'ACTIVE',
    type: String,
    required: false,
  })
  @Column({ default: 'ACTIVE' })
  status: string;

  @ApiProperty({
    description: 'Value of the project in cents',
    example: 1000,
    type: Number,
    required: false,
  })
  @Column({ nullable: true })
  value: number;

  @ApiProperty({
    description: 'Logo of the project',
    example: 'https://example.com/logo.png',
    type: String,
    required: false,
  })
  @Column({ nullable: true })
  logo: string;

  @ApiProperty({
    description: 'Website of the project',
    example: 'https://example.com',
    type: String,
    required: false,
  })
  @Column({ nullable: true })
  website: string;

  @ApiProperty({
    description: 'GitHub repository of the project',
    example: 'https://github.com/user/project.git',
    type: String,
    required: false,
  })
  @Column({ nullable: true })
  git: string;

  @ApiProperty({
    description: 'Type of the project',
    example: 'WEB',
    default: 'WEB',
    type: String,
    required: false,
  })
  @Column({ default: 'WEB' })
  type: string;

  @ApiProperty({
    description: 'User associated with the project',
    example: User,
    type: () => User,
    required: false,
  })
  @ManyToOne(() => User, (user) => user.projects, {
    onDelete: 'CASCADE',
  })
  user: User;

  @ApiProperty({
    description: 'Customer associated with the project',
    example: Customer,
    type: () => Customer,
    required: false,
  })
  @ManyToOne(() => Customer, (customer) => customer.projects, {
    onDelete: 'CASCADE',
  })
  customer: Customer;

  @ManyToOne(() => Application, {
    nullable: true,
  })
  application: Application;
}
