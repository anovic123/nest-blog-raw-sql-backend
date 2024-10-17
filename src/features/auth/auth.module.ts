import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { AdaptersModule } from '../../core/adapters/adapters.module';
import { AuthController } from './api/auth.controller';
import { AuthRepository } from './infra/auth.repository';
import { CreateUserUseCase } from './api/use-cases/create-users.use-case';
import { EmailIsExistConstraint, LoginIsExistConstraint } from '../../core/decorators';
import { UsersRepository } from '../users/infra/users.repository';
import { GetUserInfoHandler } from './api/use-cases/user-info.query.use-case';
import { AuthService } from './application/auth.service';
import { UsersQueryRepository } from '../users/infra/users-query.repository';
import { ResendCodeCommandUseCase } from './api/use-cases/resend-code.use-case';
import { ConfirmEmailUseCase } from './api/use-cases/confirm-email.use-case';
import { NewPasswordUseCase } from './api/use-cases/new-password.use-case';
import { PasswordRecoveryUseCase } from './api/use-cases/password-recovery.use-case';

@Module({
  imports: [
    AdaptersModule,
    CqrsModule
  ],
  providers: [
    ResendCodeCommandUseCase,
    CreateUserUseCase,
    ConfirmEmailUseCase,
    NewPasswordUseCase,
    PasswordRecoveryUseCase,
    GetUserInfoHandler,
    AuthService,
    AuthRepository,
    UsersQueryRepository,
    EmailIsExistConstraint,
    LoginIsExistConstraint,
    UsersRepository
  ],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule {}