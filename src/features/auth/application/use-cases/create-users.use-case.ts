import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';
import { randomUUID } from 'crypto';
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

    const user: Omit<User, 'isConfirmed'> = {
      id: uuidv4(),
      email,
      login,
      passwordHash,
      confirmationCode: uuidv4(),
      expirationDate: add(new Date(), {
        hours: 1,
        minutes: 3
      }),
      createdAt: new Date()
    }

    const createdResult = await this.authRepository.createUser(user);

    if (!createdResult) {
      throw new HttpException(
        'Error while registering user',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.emailsManager.sendConfirmationMessage({
      email: user.email,
      confirmationCode: user.confirmationCode,
    });

    return createdResult;
  }
}