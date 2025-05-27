import { Body, Controller, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Endpoint } from '@/helpers/decorators/endpoint.decorator';
import { User } from '@/users/entities/user.entity';
import { getSchemaPath } from '@nestjs/swagger';
import { Token } from './dto/token';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Endpoint({
    method: 'POST',
    path: 'register',
    statusCode: HttpStatus.CREATED,
    isPublic: true,
    throttle: {
      options: {
        default: {
          limit: 5,
          ttl: {
            seconds: 60,
          },
        },
      },
    },
    documentation: {
      summary: 'Register',
      description: 'Register a new user',
      extraModels: [Token],
      responses: {
        201: {
          description: 'Login successful',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  user: {
                    $ref: getSchemaPath(User),
                  },
                  token: {
                    $ref: getSchemaPath(Token),
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Endpoint({
    method: 'POST',
    path: 'login',
    statusCode: HttpStatus.OK,
    isPublic: true,
    throttle: {
      options: {
        default: {
          limit: 5,
          ttl: {
            seconds: 60,
          },
        },
      },
    },
    documentation: {
      summary: 'Login',
      description: 'Login to the application',
      responses: {
        200: {
          description: 'Login successful',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  user: {
                    $ref: getSchemaPath(User),
                  },
                  token: {
                    $ref: getSchemaPath(Token),
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
