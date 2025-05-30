import { Column, Entity } from 'typeorm';
import { BaseSchema } from '../../database/base-schema';

@Entity()
export class TokenBlackList extends BaseSchema {
  @Column()
  token: string;

  @Column({ nullable: true })
  reason: string;
}
