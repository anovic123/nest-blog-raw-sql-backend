import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus } from '@nestjs/common';

import { CodeInputModel } from '../../api/models/input/code.input.model';

import { UsersSqlQueryRepository } from '../../../users/infra/users-sql-query.repository';
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
      user.isConfirmed ||
      user.confirmationCode !== command.code ||
      user.expirationDate < new Date()
    ) {
      throw new HttpException('code is wrong', HttpStatus.BAD_REQUEST);
    }
    const res = await this.usersRepository.updateConfirmation(user.id);

    if (!res) {
      throw new HttpException('oops', HttpStatus.BAD_REQUEST);
    }
  }
}