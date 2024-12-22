import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CqrsModule } from '@nestjs/cqrs';

import { AuthController } from './api/auth.controller';

import { AuthService } from './application/auth.service';

import { User } from 'src/features/users/domain/users.entity';

import { UsersSqlQueryRepository } from 'src/features/users/infra/users-sql-query.repository';
import { UserTypeormQueryRepository } from 'src/features/users/infra/users-typeorm-query.repository';
import { UsersTypeormRepository } from 'src/features/users/infra/users-typeorm.repository';
import { AuthTypeormRepository } from './infra/auth-typeorm.repository';

import {
  EmailIsExistConstraint,
  LoginIsExistConstraint,
} from 'src/core/decorators';

import { AdaptersModule } from 'src/core/adapters/adapters.module';

import { GetUserInfoHandler } from './application/use-cases/user-info.query.use-case';
import { ResendCodeCommandUseCase } from './application/use-cases/resend-code.use-case';
import { ConfirmEmailUseCase } from './application/use-cases/confirm-email.use-case';
import { NewPasswordUseCase } from './application/use-cases/new-password.use-case';
import { PasswordRecoveryUseCase } from './application/use-cases/password-recovery.use-case';
import { SecurityModule } from '../security/security.module';
import { LogoutUserUseCase } from './application/use-cases/logout-user.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { CreateSessionUseCase } from './application/use-cases/create-session';
import { CreateUserUseCase } from './application/use-cases/create-users.use-case';

@Module({
  imports: [
    AdaptersModule,
    CqrsModule,
    SecurityModule,
    TypeOrmModule.forFeature([ User ])
  ],
  providers: [
    ResendCodeCommandUseCase,
    CreateUserUseCase,
    ConfirmEmailUseCase,
    NewPasswordUseCase,
    PasswordRecoveryUseCase,
    LogoutUserUseCase,
    RefreshTokenUseCase,
    CreateSessionUseCase,
    GetUserInfoHandler,
    AuthService,
    UsersTypeormRepository,
    AuthTypeormRepository,
    UsersSqlQueryRepository,
    UserTypeormQueryRepository,
    EmailIsExistConstraint,
    LoginIsExistConstraint,
    UsersTypeormRepository,
  ],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule {}