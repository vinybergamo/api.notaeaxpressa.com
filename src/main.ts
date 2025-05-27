import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const port = config.get('PORT', 3333);
  const reflector = app.get(Reflector);
  const appUrl = config.get<string | undefined>('APP_URL')?.split(/[,;]/);

  app.enableCors();
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'v',
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(reflector, {
      excludePrefixes: ['_'],
    }),
  );

  const documentBuilder = new DocumentBuilder()
    .setTitle('NestJS API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .setContact(
      'Vinycios Cavalcante Bergamo',
      'vinybergamo.cmo',
      'contato@vinybergamo.com',
    )
    .addServer(`http://localhost:${port}`, 'Local server');

  if (appUrl && appUrl.length > 0) {
    appUrl.forEach((url) => {
      if (url && url.trim()) {
        documentBuilder.addServer(url.trim());
      }
    });
  }

  documentBuilder
    .addGlobalResponse({
      status: 401,
      description: 'Unauthorized',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              statusCode: {
                type: 'number',
                default: 401,
              },
              message: {
                type: 'string',
                default: 'UNAUTHORIZED',
              },
              error: {
                type: 'string',
                default: 'Unauthorized',
              },
            },
          },
        },
      },
    })
    .addBearerAuth({
      description: 'JWT token',
      type: 'http',
      name: 'bearer',
      scheme: 'bearer',
      in: 'header',
      bearerFormat: 'JWT',
      'x-tokenName': 'Authorization',
    });

  const documentConfig = documentBuilder.build();
  const documentFactory = () =>
    SwaggerModule.createDocument(app, documentConfig);
  SwaggerModule.setup('docs', app, documentFactory, {
    raw: true,
    explorer: true,
  });

  await app.listen(port, () => {
    logger.log(`Server listening on port ${port}`);
  });
}
bootstrap();
