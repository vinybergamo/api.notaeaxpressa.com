import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/database/base-repository';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersRepository extends BaseRepository<User> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super(userRepository);
  }

  async findByEmail(email: string): Promise<User> {
    return this.findOne({ email });
  }

  async findByEmailOrFail(email: string): Promise<User> {
    return this.findOneOrFail({ email });
  }
}
