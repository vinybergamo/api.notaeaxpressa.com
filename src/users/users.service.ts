import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async me(id: Id) {
    return this.usersRepository.findByIdOrFail(id);
  }
}
