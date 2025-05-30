import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '@/helpers/guards/auth.guard';
import { ApplicationsModule } from '@/applications/applications.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenBlackList } from '@/tokens/entities/token.entity';
import { TokensBlackListsRepository } from '@/tokens/tokens.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([TokenBlackList]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.getOrThrow('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.getOrThrow('JWT_EXPIRES_IN'),
        },
      }),
    }),
    ApplicationsModule,
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokensBlackListsRepository,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AuthModule {}
