# API de Autenticação com NestJS

## Descrição

Projeto NestJS que provê uma API RESTful com autenticação JWT, CRUD de usuários e documentação automática via Swagger.
Utiliza PostgreSQL (TypeORM) para persistência, configurações via `@nestjs/config`, DTOs com validação e cache HTTP.

## Recursos

- Registro de usuário (`/api/v1/auth/register`)
- Login e emissão de JWT (`/api/v1/auth/login`)
- Rotas protegidas por guardas de autenticação
- Retorna o usuário logado (`/api/v1/users/me`)
- Versionamento de API (prefixo `/api/v1`)
- Documentação interativa Swagger (`/docs`)
- Cache HTTP via decorator e interceptor
- Validação de payloads com `class-validator`

## Pré-requisitos

- Node.js ≥ 18
- pnpm
- PostgreSQL rodando e acessível

## Instalação

```bash
# Clone o repositório
$ git clone https://github.com/vinybergamo/nestjs-api-auth.git
$ cd nestjs-api-auth

# Instale dependências
$ pnpm install
```

## Variáveis de Ambiente

Copie o arquivo de exemplo e preencha as variáveis:

```bash
$ cp .env.example .env
```

```env
DATABASE_URL=postgres://user:senha@host:porta/banco
JWT_SECRET=segredo_para_assinar_tokens
JWT_EXPIRES_IN=1d        # ex: 3600s, 1d, 7d
PORT=3333                # porta padrão
APP_URL=http://meu-servidor  # (opcional) servidores adicionais no Swagger
```

## Execução

```bash
# Modo desenvolvimento (com hot-reload)
$ pnpm run start:dev

# Produção
$ pnpm run start:prod
```

## Documentação da API

Após iniciar a aplicação, acesse:

```
http://localhost:<PORT>/docs
```

para explorar todos os endpoints e modelos via Swagger/OpenAPI.

### Endpoints de Autenticação

- `POST /api/v1/auth/register` — cria novo usuário e retorna o token JWT
- `POST /api/v1/auth/login` — autentica e retorna token JWT

### Endpoints de Usuário (protegidos)

> Inclua header `Authorization: Bearer <token>`

- `GET    /api/v1/me` — retorna o usuário com base no JWT

## Decorators Customizados

Este projeto dispõe de _decorators_ que facilitam o uso de cache, definição de endpoints e extração do usuário autenticado.

### 1. Cache

Usa o interceptor `HttpCacheInterceptor` com TTL customizável.

```ts
import { Controller, Get } from '@nestjs/common';
import { Cache } from '@/helpers/decorators/cache.decorator';

@Controller('items')
export class ItemsController {
  // Cache de 60 segundos com chave customizada 'items_list'
  @Get()
  @Cache(60000, 'items_list')
  findAll() {
    // ...
  }

  // Cache por duração de date-fns (ex.: 5 minutos)
  @Get('top')
  @Cache({ minutes: 5 })
  findTopItems() {
    // ...
  }

  // Desabilita cache
  @Get('no-cache')
  @Cache(undefined, undefined, true)
  noCache() {
    // ...
  }
}
```

### 2. Endpoint

Unifica atributos de rota (método, status, versionamento, documentação, cache, _throttling_, upload de arquivos e público/privado).

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
      summary: 'Cria um usuário',
      description: 'Endpoint para registro de usuário',
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
    documentation: { summary: 'Busca usuário por ID' },
    version: '1',
  })
  findOne(@Param('id') id: string): Promise<User> {
    // ...
  }
}
```

### 3. IsPublic

Marca rota como pública (não requer JWT).

```ts
import { Controller, Get } from '@nestjs/common';
import { Endpoint } from '@/helpers/decorators/endpoint.decorator';

@Controller('public')
export class PublicController {
  @Endpoint({
    method: 'GET',
    path: '',
    isPublic: true,
    documentation: { summary: 'Rota pública' },
  })
  getPublic() {
    return { ok: true };
  }
}
```

### 4. Me

Injeta o usuário autenticado extraído do JWT.

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
}
```

## Testes

```bash
# Testes unitários
$ pnpm run test

# Testes end-to-end
$ pnpm run test:e2e

# Cobertura de testes
$ pnpm run test:cov
```

## Ferramentas e Tecnologias

- NestJS
- TypeScript
- TypeORM + PostgreSQL
- JWT (`@nestjs/jwt`)
- Swagger / OpenAPI
- class-validator & class-transformer
- pnpm, ESLint, Prettier

## Licença

Este projeto está licenciado sob a licença MIT.
