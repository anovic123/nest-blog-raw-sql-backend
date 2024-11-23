import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';

import { UsersTypeormRepository } from '../../infra/users-typeorm.repository';

export class DeleteUserCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(private readonly usersRepository: UsersTypeormRepository) {}

  async execute(command: DeleteUserCommand) {
    const { id } = command;

    const user = await this.usersRepository.findUserById(id);

    if (!user) {
      throw new NotFoundException()
    }

    return this.usersRepository.deleteUser(id);
  }
}