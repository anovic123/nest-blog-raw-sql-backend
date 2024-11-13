import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AdaptersModule } from '../../core/adapters/adapters.module';
import { UsersController } from './api/users.controller';
import { UsersQueryRepository } from './infra/users-query.repository';
import { AuthRepository } from '../auth/infra/auth.repository';
import { DeleteUserUseCase } from './application/use-cases/delete-users.use-case';
import { UsersRepository } from './infra/users.repository';

@Module({
  imports: [
    CqrsModule,
    AdaptersModule
  ],
  controllers: [UsersController],
  providers: [
    UsersQueryRepository,
    AuthRepository,
    UsersRepository,
    DeleteUserUseCase
  ],
  exports: [
    UsersRepository
  ]
})
export class UsersModule {}