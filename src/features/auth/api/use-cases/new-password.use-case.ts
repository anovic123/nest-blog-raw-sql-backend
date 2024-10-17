import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { NewPasswordInputModel } from '../../api/models/input/new-password.input.model';

import { UsersQueryRepository } from '../../../users/infra/users-query.repository';
import { CryptoService } from '../../../../core/adapters/crypto-service';
import { UsersRepository } from '../../../users/infra/users.repository';
import { HttpException, HttpStatus } from '@nestjs/common';

export class NewPasswordCommand {
  constructor(public readonly body: NewPasswordInputModel) {}
}

@CommandHandler(NewPasswordCommand)
export class NewPasswordUseCase implements ICommandHandler<NewPasswordCommand> {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly cryptoService: CryptoService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: NewPasswordCommand): Promise<boolean> {
    const { newPassword, recoveryCode } = command.body;
    const user =
      await this.usersQueryRepository.findUserByConfirmationCode(recoveryCode);

    if (!user) {
      throw new HttpException('User is not found', HttpStatus.BAD_REQUEST);
    }

    if (
      user.confirmationCode !== recoveryCode ||
      user.expirationDate < new Date()
    ) {
      throw new HttpException('Wrong code', HttpStatus.BAD_REQUEST);
    }

    const newPasswordHash = await this.cryptoService.generateHash(newPassword);

    const newPasswordHashRes =
      await this.usersRepository.updateUserPasswordHash(
        user.id,
        newPasswordHash,
      );

    if (!newPasswordHashRes) {
      throw new HttpException('Something went wrong', HttpStatus.BAD_REQUEST);
    }
    return true;
  }
}