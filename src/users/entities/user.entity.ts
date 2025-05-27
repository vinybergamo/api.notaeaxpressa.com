import { BeforeInsert, Column, Entity } from 'typeorm';
import { BaseSchema } from 'src/database/base-schema';
import { Exclude } from 'class-transformer';
import { hashSync, compareSync, genSaltSync } from 'bcrypt';
import { ApiHideProperty, ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({
  name: 'UserEntity',
})
@Entity()
export class User extends BaseSchema {
  @ApiProperty({
    description: 'Name of the user',
    example: 'John Doe',
  })
  @Column()
  name: string;

  @ApiProperty({
    description: 'Email of the user',
    example: 'john_doe@email.comm',
  })
  @Column()
  email: string;

  @Exclude()
  @Column()
  @ApiHideProperty()
  password: string;

  @ApiProperty({
    description: 'Avatar of the user',
    example: 'https://example.com/avatar.jpg',
  })
  @Column({ nullable: true })
  avatar: string;

  hashPassword() {
    const salt = genSaltSync(10);
    const hash = hashSync(this.password, salt);
    this.password = hash;
  }

  passwordMatch(password: string): boolean {
    return compareSync(password, this.password);
  }

  @BeforeInsert()
  beforeInsertActions() {
    this.hashPassword();
  }
}
