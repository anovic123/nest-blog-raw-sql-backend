import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus } from '@nestjs/common';

import { CryptoService } from '../../../../core/adapters/crypto-service';
import { EmailsManager } from '../../../../core/adapters/email.manager';
import { User } from '../../../users/domain/users.entity';
import { UserOutputModel } from '../../api/models/output/user.output.model';
import { AuthTypeormRepository } from '../../infra/auth-typeorm.repository';

class UserInputModel {
  login: string;
  password: string;
  email: string;
}

export class CreateUserCommand {
  constructor(public readonly body: UserInputModel) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly cryptoService: CryptoService,
    private readonly authRepository: AuthTypeormRepository,
    private readonly emailsManager: EmailsManager
  ) {}

  async execute(command: CreateUserCommand): Promise<UserOutputModel> {
    const { login, password, email } = command.body

    const passwordHash = await this.cryptoService.generateHash(password)

    const newUser = User.createUser(login, passwordHash, email)

    const createdResult = await this.authRepository.createUser(newUser);

    if (!createdResult) {
      throw new HttpException(
        'Error while registering user',
        HttpStatus.BAD_REQUEST,
      );
    }

    this.emailsManager.sendConfirmationMessage({
      email: newUser.email,
      confirmationCode: newUser.confirmationCode,
    }).catch(error => {
      console.error('Failed to send confirmation email:', error);
    });

    return createdResult;
  }
}