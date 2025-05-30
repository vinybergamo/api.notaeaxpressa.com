import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from './entities/application.entity';
import { ApplicationsRepository } from './applications.repository';
import { TokenBlackList } from '@/tokens/entities/token.entity';
import { TokensBlackListsRepository } from '@/tokens/tokens.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Application, TokenBlackList]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.getOrThrow('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [ApplicationsController],
  providers: [
    ApplicationsService,
    ApplicationsRepository,
    TokensBlackListsRepository,
  ],
  exports: [ApplicationsService, ApplicationsRepository],
})
export class ApplicationsModule {}
