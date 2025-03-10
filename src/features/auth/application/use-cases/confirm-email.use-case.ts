import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';

import { CodeInputModel } from 'src/features/auth/api/models/input/code.input.model';

import { UsersTypeormRepository } from 'src/features/users/infra/users-typeorm.repository';
import { UserTypeormQueryRepository } from 'src/features/users/infra/users-typeorm-query.repository';

export class ConfirmEmailCommand {
  constructor(public readonly code: CodeInputModel['code']) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase
  implements ICommandHandler<ConfirmEmailCommand>
{
  constructor(
    private readonly usersQueryRepository: UserTypeormQueryRepository,
    private readonly usersRepository: UsersTypeormRepository,
  ) {}

  async execute(command: ConfirmEmailCommand) {

    const user = await this.usersQueryRepository.findUserByConfirmationCode(
      command.code,
    );
    
    if (
      !user ||
      user.confirmationCode !== command.code ||
      user.expirationDate < new Date() || user?.isConfirmed
    ) {
      throw new BadRequestException('code is wrong');
    }
    const res = await this.usersRepository.updateConfirmation(user.id);

    if (!res) {
      throw new BadRequestException('oops');
    }
  }
}
