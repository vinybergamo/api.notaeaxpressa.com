import { AuthService } from '@auth/auth.service';
import { UsersRepository } from '@users/users.repository';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { isPublicMetaKey } from '../decorators/is-public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.get<boolean>(
      isPublicMetaKey,
      context.getHandler(),
    );

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const headers = request.headers;
    const authorization = headers?.authorization;
    const [type, token] = authorization?.split(' ') || [];

    if (type !== 'Bearer' || !token)
      throw new UnauthorizedException('UNAUTHORIZED');

    const payload = this.authService.validateToken(token);

    const user = await this.usersRepository.findById(payload.sub);

    if (!user) throw new UnauthorizedException('UNAUTHORIZED');

    request.user = user;

    return true;
  }
}
