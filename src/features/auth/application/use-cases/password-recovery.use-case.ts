import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';

import { EmailsManager } from '@core/adapters/email.manager';

import { UserTypeormQueryRepository } from 'src/features/users/infra/users-typeorm-query.repository';
import { UsersTypeormRepository } from 'src/features/users/infra/users-typeorm.repository';

export class PasswordRecoveryCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase
  implements ICommandHandler<PasswordRecoveryCommand>
{
  constructor(
    private readonly emailsManager: EmailsManager,
    private readonly usersQueryRepository: UserTypeormQueryRepository,
    private readonly usersRepository: UsersTypeormRepository,
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