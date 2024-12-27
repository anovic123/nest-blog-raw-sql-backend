import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus } from '@nestjs/common';

import { NewPasswordInputModel } from 'src/features/auth/api/models/input/new-password.input.model';

import { CryptoService } from '@core/adapters/crypto-service';

import { UsersTypeormRepository } from 'src/features/users/infra/users-typeorm.repository';
import { UserTypeormQueryRepository } from 'src/features/users/infra/users-typeorm-query.repository';

export class NewPasswordCommand {
  constructor(public readonly body: NewPasswordInputModel) {}
}

@CommandHandler(NewPasswordCommand)
export class NewPasswordUseCase implements ICommandHandler<NewPasswordCommand> {
  constructor(
    private readonly usersQueryRepository: UserTypeormQueryRepository,
    private readonly cryptoService: CryptoService,
    private readonly usersRepository: UsersTypeormRepository,
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