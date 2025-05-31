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
import { Request, Response } from 'express';
import { TokensBlackListsRepository } from '@/tokens/tokens.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly tokensBlackListsRepository: TokensBlackListsRepository,
  ) {}

  async register(registerDto: RegisterDto, res: Response) {
    const exists = await this.usersRepository.findByEmail(registerDto.email);

    if (exists) {
      throw new BadRequestException(
        'USER_ALREADY_EXISTS',
        'User already exists',
      );
    }

    const user = await this.usersRepository.create(registerDto);

    const token = this.generateToken(user);

    res.cookie('access_token', token.value, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: token.expiresIn,
    });

    return {
      user,
      token,
    };
  }

  async login(loginDto: LoginDto, res: Response) {
    const user = await this.usersRepository.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException(
        'INVALID_CREDENTIALS',
        'Invalid credentials',
      );
    }

    const passwordMatches = user.passwordMatch(loginDto.password);

    if (!passwordMatches) {
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }

    const token = this.generateToken(user);

    res.cookie('access_token', token.value, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: token.expiresIn,
    });

    return {
      user,
      token,
    };
  }

  async logout(res: Response, req: Request, accessToken?: string) {
    const token =
      accessToken ||
      req.cookies.access_token ||
      req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new BadRequestException('TOKEN_REQUIRED', 'Token is required');
    }

    const blackListed = await this.tokensBlackListsRepository.create({
      token,
    });

    res.clearCookie('access_token', {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
    });

    return blackListed;
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
    const expiresIn = this.configService.get('JWT_EXPIRES_IN', '1d');
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
