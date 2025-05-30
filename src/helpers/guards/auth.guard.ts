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
import { ApplicationsRepository } from '@/applications/applications.repository';
import { TokensBlackListsRepository } from '@/tokens/tokens.repository';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
    private readonly usersRepository: UsersRepository,
    private readonly applicationsRepository: ApplicationsRepository,
    private readonly tokensBlackListsRepository: TokensBlackListsRepository,
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
    const isBlackListed = await this.tokensBlackListsRepository.findOne({
      token,
    });

    if (isBlackListed) {
      throw new UnauthorizedException('UNAUTHORIZED');
    }

    const payload = this.authService.validateToken(token);

    const application = payload.isApplication
      ? await this.applicationsRepository.findByIdOrFail(payload.sub, {
          relations: ['user'],
        })
      : null;

    const userRequest = !payload.isApplication
      ? await this.usersRepository.findByIdOrFail(payload.sub)
      : null;

    const user = payload.isApplication ? application.user : userRequest;

    if (!user) throw new UnauthorizedException('UNAUTHORIZED');

    if (payload.isApplication) {
      request.level = 'APPLICATION';
    }

    if (!payload.isApplication) {
      request.level = 'USER';
    }

    request.user = user;

    return true;
  }
}
