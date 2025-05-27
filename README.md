# Authentication API with NestJS

## Description

NestJS project providing a RESTful API with JWT authentication, user CRUD and automatic Swagger documentation. Uses PostgreSQL (TypeORM) for persistence, configuration via `@nestjs/config`, DTOs with validation and HTTP caching.

## Features

- User registration (`/api/v1/auth/register`)
- Login and JWT issuance (`/api/v1/auth/login`)
- Protected routes with authentication guards
- Returns the logged-in user (`/api/v1/users/me`)
- API versioning (prefix `/api/v1`)
- Interactive Swagger documentation (`/docs`)
- HTTP caching via decorator and interceptor
- Payload validation using `class-validator`

## Prerequisites

- Node.js ≥ 18
- pnpm
- Running and accessible PostgreSQL database

## Installation

```bash
# Clone the repository
$ git clone https://github.com/vinybergamo/nestjs-api-auth.git
$ cd nestjs-api-auth

# Install dependencies
$ pnpm install
```

## Environment Variables

Copy the example file and fill in your variables:

```bash
$ cp .env.example .env
```

```env
DATABASE_URL=postgres://user:password@host:port/dbname
JWT_SECRET=secret_for_signing_tokens
JWT_EXPIRES_IN=1d        # e.g. 3600s, 1d, 7d
PORT=3333                # default port
APP_URL=http://my-server # (optional) extra servers in Swagger
```

## Running the App

```bash
# Development mode (hot-reload)
$ pnpm run start:dev

# Production mode
$ pnpm run start:prod
```

## API Documentation

After starting the application, visit:

```
http://localhost:<PORT>/docs
```

to explore all endpoints and schemas via Swagger / OpenAPI.

### Authentication Endpoints

- `POST /api/v1/auth/register` — create a new user and return a JWT
- `POST /api/v1/auth/login`    — authenticate and return a JWT

### User Endpoints (protected)

> Include header `Authorization: Bearer <token>`

- `GET /api/v1/users/me` — return the user based on the JWT

## Custom Decorators

The project provides decorators to simplify cache usage, endpoint definition, and authenticated-user extraction.

### 1. Cache

Uses the `HttpCacheInterceptor` with a customizable TTL.

```ts
import { Controller, Get } from '@nestjs/common';
import { Cache } from '@/helpers/decorators/cache.decorator';

@Controller('items')
export class ItemsController {
  // Cache for 60 seconds with custom key 'items_list'
  @Get()
  @Cache(60000, 'items_list')
  findAll() {
    // ...
  }

  // Cache with date-fns duration (e.g. 5 minutes)
  @Get('top')
  @Cache({ minutes: 5 })
  findTopItems() {
    // ...
  }

  // Disable cache
  @Get('no-cache')
  @Cache(undefined, undefined, true)
  noCache() {
    // ...
  }
}
```

### 2. Endpoint

Unifies route attributes (method, status, versioning, documentation, cache, throttling, file uploads, and public/private).

```ts
import { Controller, Body, Param } from '@nestjs/common';
import { Endpoint } from '@/helpers/decorators/endpoint.decorator';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { User } from '@/users/entities/user.entity';

@Controller('users')
export class UsersController {
  @Endpoint({
    method: 'POST',
    path: '',
    statusCode: 201,
    documentation: {
      summary: 'Create a user',
      description: 'Endpoint to register a new user',
      extraModels: [User],
    },
    cache: { ttl: { seconds: 30 }, key: 'user_create' },
    throttle: { options: { limit: 5, ttl: { minutes: 1 } } },
    isPublic: true,
  })
  create(@Body() dto: CreateUserDto): Promise<User> {
    // ...
  }

  @Endpoint({
    method: 'GET',
    path: ':id',
    documentation: { summary: 'Find user by ID' },
    version: '1',
  })
  findOne(@Param('id') id: string): Promise<User> {
    // ...
  }
}
```

### 3. IsPublic

Marks a route as public (no JWT required).

```ts
import { Controller, Get } from '@nestjs/common';
import { Endpoint } from '@/helpers/decorators/endpoint.decorator';

@Controller('public')
export class PublicController {
  @Endpoint({
    method: 'GET',
    path: '',
    isPublic: true,
    documentation: { summary: 'Public route' },
  })
  getPublic() {
    return { ok: true };
  }
}
```

### 4. Me

Injects the authenticated user extracted from the JWT.

```ts
import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import { Me } from '@/helpers/decorators/me.decorator';
import { Endpoint } from '@/helpers/decorators/endpoint.decorator';
import { HttpStatusCode } from 'axios';
import { User } from './entities/user.entity';
import { getSchemaPath } from '@nestjs/swagger';

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
          ttl: { minutes: 1 },
        },
      },
    },
    cache: { ttl: { minutes: 1 } },
    documentation: {
      summary: 'Get current user',
      description: 'Get current user information',
      security: [{ bearer: [] }],
      extraModels: [User],
      responses: {
        200: {
          description: 'Current user information',
          content: {
            'application/json': {
              schema: { $ref: getSchemaPath(User) },
            },
          },
        },
      },
    },
  })
  async me(@Me() me: { id: string }) {
    return this.usersService.me(me.id);
  }
}
```

## Tests

```bash
# Unit tests
$ pnpm run test

# End-to-end tests
$ pnpm run test:e2e

# Test coverage
$ pnpm run test:cov
```

## Tools & Technologies

- NestJS
- TypeScript
- TypeORM + PostgreSQL
- JWT (`@nestjs/jwt`)
- Swagger / OpenAPI
- class-validator & class-transformer
- pnpm, ESLint, Prettier

## License

This project is licensed under the MIT License.
