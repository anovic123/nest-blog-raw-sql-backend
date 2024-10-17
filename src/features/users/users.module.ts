import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AdaptersModule } from '../../core/adapters/adapters.module';
import { UsersController } from './api/users.controller';
import { UsersQueryRepository } from './infra/users-query.repository';
import { AuthRepository } from '../auth/infra/auth.repository';
import { DeleteUserUseCase } from './application/use-cases/delete-users.use-case';
import { UsersRepository } from './infra/users.repository';
import { EmailIsExistConstraint, LoginIsExistConstraint } from '../../core/decorators';

@Module({
  imports: [
    CqrsModule,
    UsersModule,
    AdaptersModule
  ],
  controllers: [UsersController],
  providers: [
    UsersQueryRepository,
    AuthRepository,
    UsersRepository,
    EmailIsExistConstraint,
    LoginIsExistConstraint,
    DeleteUserUseCase
  ],
  exports: [
    UsersRepository
  ]
})
export class UsersModule {}