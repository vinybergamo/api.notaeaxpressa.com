import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        autoLoadEntities: true,
        synchronize: true,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        url: configService.getOrThrow('DATABASE_URL'),
      }),
    }),
  ],
})
export class DatabaseModule {}
