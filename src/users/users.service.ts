import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async me(id: Id) {
    return this.usersRepository.findByIdOrFail(id);
  }

  async changePassword(me: UserRequest, changePasswordDto: ChangePasswordDto) {
    const user = await this.usersRepository.findByIdOrFail(me.id);

    const isValidPassword = user.passwordMatch(changePasswordDto.password);
    const newIsCurrentPassword = user.passwordMatch(
      changePasswordDto.newPassword,
    );

    if (!isValidPassword) {
      throw new BadRequestException('INVALID_PASSWORD', 'Invalid password');
    }

    if (newIsCurrentPassword) {
      throw new BadRequestException(
        'CURRENT_PASSWORD',
        'New password cannot be the same as the current password',
      );
    }

    const newPassword = user.hashPassword(changePasswordDto.newPassword);

    return this.usersRepository.update(user.id, {
      password: newPassword,
    });
  }
}
