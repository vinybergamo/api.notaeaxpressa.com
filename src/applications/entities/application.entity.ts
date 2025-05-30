import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseSchema } from '../../database/base-schema';
import { Exclude } from 'class-transformer';
import { User } from '@/users/entities/user.entity';

@Entity()
export class Application extends BaseSchema {
  @Column({ default: 1 })
  index: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: true })
  url: string;

  @Column()
  maskedToken: string;

  @Exclude()
  @Column()
  token: string;

  @ManyToOne(() => User, (user) => user.applications, {
    eager: true,
    nullable: false,
    onDelete: 'CASCADE',
  })
  user: User;
}
