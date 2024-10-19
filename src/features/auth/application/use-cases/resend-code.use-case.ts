import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { EmailResendingModel } from '../../api/models/input/email-resending.input.model';

import { UsersRepository } from '../../../users/infra/users.repository';
import { UsersQueryRepository } from '../../../users/infra/users-query.repository';

import { EmailsManager } from '../../../../core/adapters/email.manager';

export class ResendCodeCommand {
  constructor(public readonly emailModel: EmailResendingModel) {}
}

@CommandHandler(ResendCodeCommand)
export class ResendCodeCommandUseCase
  implements ICommandHandler<ResendCodeCommand>
{
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly usersRepository: UsersRepository,
    private readonly emailsManager: EmailsManager,
  ) {}

  async execute(command: ResendCodeCommand) {
    const { email } = command.emailModel;

    const user = await this.usersQueryRepository.findUserByLoginOrEmail(email);

    if (!user) {
      throw new HttpException('email is not existed', HttpStatus.BAD_REQUEST);
    }

    if (user.isConfirmed) {
      throw new HttpException('email is confirmed', HttpStatus.BAD_REQUEST);
    }

    const newCode = uuidv4();

    await this.usersRepository.updateUserConfirmationCode(
      user.id,
      newCode,
    );
    await this.emailsManager.sendConfirmationMessage({
      email: user.email,
      confirmationCode: newCode,
    });
    return true;
  }
}