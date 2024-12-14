import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdaptersModule } from '../../core/adapters/adapters.module';

import { User } from './domain/users.entity';

import { UsersController } from './api/users.controller';

import { DeleteUserUseCase } from './application/use-cases/delete-users.use-case';

import { UsersSqlQueryRepository } from './infra/users-sql-query.repository';
import { AuthSqlRepository } from '../auth/infra/auth-sql.repository';
import { UserTypeormQueryRepository } from './infra/users-typeorm-query.repository';
import { UsersTypeormRepository } from './infra/users-typeorm.repository';

@Module({
  imports: [
    CqrsModule,
    AdaptersModule,
    TypeOrmModule.forFeature([User])
  ],
  controllers: [UsersController],
  providers: [
    UsersSqlQueryRepository,
    UserTypeormQueryRepository,
    AuthSqlRepository,
    UsersTypeormRepository,
    DeleteUserUseCase
  ],
  exports: [
    UsersTypeormRepository,
  ]
})
export class UsersModule {}