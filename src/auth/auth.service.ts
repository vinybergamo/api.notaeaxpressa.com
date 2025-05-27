import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { millisecondsToSeconds, set } from 'date-fns';
import ms from 'ms';
import { UsersRepository } from 'src/users/users.repository';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const exists = await this.usersRepository.findByEmail(registerDto.email);

    if (exists) {
      throw new BadRequestException('USER_ALREADY_EXISTS');
    }

    const user = await this.usersRepository.create(registerDto);

    return {
      user,
      token: this.generateToken(user),
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }

    const passwordMatches = user.passwordMatch(loginDto.password);

    if (!passwordMatches) {
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }

    return {
      user,
      token: this.generateToken(user),
    };
  }

  validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch {
      throw new UnauthorizedException('UNAUTHORIZED');
    }
  }

  private generateToken(user: User) {
    const expiresIn = this.configService.get('JWT_EXPIRES_IN');
    const payload = { sub: user.id };
    const expiresMs = Number(ms(expiresIn));
    const expiresInSeconds = millisecondsToSeconds(expiresMs);
    const expiresAt = set(new Date(), { seconds: expiresInSeconds });
    const generatedAt = new Date();
    const generatedIn = generatedAt.getTime();
    const token = this.jwtService.sign(payload);

    return {
      type: 'Bearer',
      value: token,
      expiresAt,
      expiresIn: expiresAt.getTime(),
      expiresInSeconds,
      generatedAt,
      generatedIn,
    };
  }
}
