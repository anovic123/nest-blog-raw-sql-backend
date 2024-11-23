import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';

import { SecurityTypeormRepository } from 'src/features/security/infra/securite-typeorm.repository';
import {
  JwtRefreshPayloadExtended,
  JwtService,
} from '../../../../core/adapters/jwt-service';

export class LogoutUserCommand {
  constructor(public readonly requestRefreshToken: string) {}
}

@CommandHandler(LogoutUserCommand)
export class LogoutUserUseCase implements ICommandHandler<LogoutUserCommand> {
  constructor(
    private readonly securityRepository: SecurityTypeormRepository,
    private jwtService: JwtService,
  ) {}

  async execute(command: LogoutUserCommand): Promise<boolean> {
    const { requestRefreshToken } = command;

    const decodedToken =
      await this.jwtService.verifyToken<JwtRefreshPayloadExtended>(
        requestRefreshToken,
      );

    if (!decodedToken) {
      throw new UnauthorizedException();
    }

    const checkDeviceUser = await this.securityRepository.checkUserDeviceById(
      decodedToken.userId,
      decodedToken.deviceId,
    );

    if (!checkDeviceUser) {
      throw new UnauthorizedException();
    }

    const res = await this.securityRepository.deleteUserDeviceById(
      decodedToken.deviceId,
    );
    return res;
  }
}