import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import path from 'path';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    NestMailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.getOrThrow<string>('SMTP_HOST');
        const port = configService.getOrThrow<string>('SMTP_PORT');
        const secure =
          configService.get<string>('SMTP_SECURE', 'true') === 'true';
        const user = configService.getOrThrow<string>('SMTP_USER');
        const pass = configService.getOrThrow<string>('SMTP_PASS');
        const defaultsFrom = configService.get<string>('SMTP_DEFAULTS_FROM');

        return {
          transport: {
            host,
            port: parseInt(port, 10),
            secure,
            auth: {
              user,
              pass,
            },
          },
          defaults: {
            from: defaultsFrom || `"No Reply" <${user}>`,
          },
          template: {
            dir: path.join(__dirname, 'templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
    }),
  ],
  providers: [MailerService],
})
export class MailerModule {}
