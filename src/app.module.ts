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
import { QuizModule } from './features/quiz/quiz.module';

import { EmailIsExistConstraint, LoginIsExistConstraint } from '@core/decorators';
import { PostIsExistConstraint } from '@core/decorators/validate/is-post-exist.decorator';
import { BlogIsExistConstraint } from '@core/decorators/validate/is-blog-exist.decorator';

const modules = [
  AuthModule,
  UsersModule,
  BloggersModule,
  SecurityModule,
  TestingModule,
  QuizModule
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
        autoLoadEntities: true, // true
        synchronize: false,
        ssl: {
          rejectUnauthorized: false,
        },
        logging: true
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
  providers: [
    EmailIsExistConstraint,
    LoginIsExistConstraint,
    PostIsExistConstraint,
    BlogIsExistConstraint
  ],
})
export class AppModule {}
