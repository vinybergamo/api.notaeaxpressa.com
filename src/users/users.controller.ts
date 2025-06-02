import { Body, Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import { Me } from '@/helpers/decorators/me.decorator';
import { Endpoint } from '@/helpers/decorators/endpoint.decorator';
import { HttpStatusCode } from 'axios';
import { User } from './entities/user.entity';
import { getSchemaPath } from '@nestjs/swagger';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Endpoint({
    method: 'GET',
    path: 'me',
    statusCode: HttpStatusCode.Ok,
    throttle: {
      options: {
        default: {
          limit: 100,
          ttl: {
            minutes: 1,
          },
        },
      },
    },
    cache: {
      ttl: {
        minutes: 1,
      },
    },
    documentation: {
      summary: 'Get current user',
      description: 'Get current user information',
      security: [
        {
          bearer: [],
        },
      ],
      extraModels: [User],
      responses: {
        200: {
          description: 'Current user information',
          content: {
            'application/json': {
              schema: {
                $ref: getSchemaPath(User),
              },
            },
          },
        },
      },
    },
  })
  async me(@Me() me: UserRequest) {
    return this.usersService.me(me.id);
  }

  @Endpoint({
    method: 'PATCH',
    path: 'me/password',
  })
  async changePassword(
    @Me() me: UserRequest,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(me, changePasswordDto);
  }
}
