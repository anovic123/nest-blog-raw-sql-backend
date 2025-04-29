import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

import configuration from '../settings/configuration';

import { AuthModule } from "src/features/auth/auth.module";
import { BloggersModule } from "src/features/bloggers/bloggers.module";
import { QuizModule } from "src/features/quiz/quiz.module";
import { SecurityModule } from "src/features/security/security.module";
import { TestingModule } from "src/features/testing/testing.module";
import { UsersModule } from "src/features/users/users.module";

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
    ScheduleModule.forRoot(),
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
        synchronize: true,
        ssl: {
          rejectUnauthorized: false,
        },
        // logging: true
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
  ]
})
export class CoreModule {}