import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmailsManager } from '../../../../core/adapters/email.manager';
import { UsersQueryRepository } from '../../../users/infra/users-query.repository';
import { v4 as uuidv4 } from 'uuid';
import { UsersRepository } from '../../../users/infra/users.repository';

export class PasswordRecoveryCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase
  implements ICommandHandler<PasswordRecoveryCommand>
{
  constructor(
    private readonly emailsManager: EmailsManager,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: PasswordRecoveryCommand) {
    const newCode = uuidv4();

    const { email } = command;

    await this.emailsManager.sendRecoveryMessage({
      email,
      confirmationCode: newCode,
    });

    const user = await this.usersQueryRepository.findUserByLoginOrEmail(email);

    if (!user) return true;

    await this.usersRepository.updateUserConfirmationCode(
      user.id,
      newCode,
    );
    return true;
  }
}