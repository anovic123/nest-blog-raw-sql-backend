import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';

import configuration from './settings/configuration';

import { AuthModule } from './features/auth/auth.module';
import { UsersModule } from './features/users/users.module';
import { TestingModule } from './features/testing/testing.module';
import { SecurityModule } from './features/security/security.module';
import { BloggersModule } from './features/bloggers/bloggers.module';
const modules = [
  AuthModule,
  UsersModule,
  BloggersModule,
  SecurityModule,
  TestingModule
]

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env'
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: true,
        ssl: {
          rejectUnauthorized: false,
        },
      }),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 10000,
        limit: 5
      }
    ]),
    ...modules
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
