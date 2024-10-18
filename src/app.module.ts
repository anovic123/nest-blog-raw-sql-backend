import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';

import configuration from './settings/configuration';

import { AuthModule } from './features/auth/auth.module';
import { UsersModule } from './features/users/users.module';
import { TestingModule } from './features/testing/testing.module';
import { SecurityModule } from './features/security/security.module';

const modules = [
  AuthModule,
  UsersModule,
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
      useFactory: () => {
        return {
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'vadim',
          password: '123',
          database: 'blog_db',
          autoLoadEntities: true,
          synchronize: true
        }
      }
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
