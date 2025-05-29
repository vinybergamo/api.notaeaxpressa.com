import { BeforeInsert, Column, Entity, OneToMany } from 'typeorm';
import { BaseSchema } from 'src/database/base-schema';
import { Exclude } from 'class-transformer';
import { hashSync, compareSync, genSaltSync } from 'bcrypt';
import { ApiHideProperty, ApiProperty, ApiSchema } from '@nestjs/swagger';
import { Customer } from '@/customers/entities/customer.entity';
import { Charge } from '@/charges/entities/charge.entity';
import { Project } from '@/projects/entities/project.entity';

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

  @ApiProperty({
    description: 'Customers associated with the user',
    example: () => [Customer],
    type: () => [Customer],
  })
  @OneToMany(() => Customer, (customer) => customer.user, {
    cascade: true,
  })
  customers: Customer[];

  @ApiProperty({
    description: 'Charges associated with the user',
    example: () => [Charge],
    type: () => [Charge],
  })
  @OneToMany(() => Charge, (charge) => charge.user, {
    cascade: true,
  })
  charges: Charge[];

  @ApiProperty({
    description: 'Projects associated with the user',
    example: () => [Project],
    type: () => [Project],
  })
  @OneToMany(() => Project, (project) => project.user, {
    cascade: true,
  })
  projects: Project[];

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
