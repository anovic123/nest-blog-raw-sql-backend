import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';

import { SecurityTypeormRepository } from 'src/features/security/infra/securite-typeorm.repository';
import {
  JwtRefreshPayloadExtended,
  JwtService,
} from '@core/adapters/jwt-service';

export class LogoutUserCommand {
  constructor(public readonly requestRefreshToken: string) {}
}

@CommandHandler(LogoutUserCommand)
export class LogoutUserUseCase implements ICommandHandler<LogoutUserCommand> {
  constructor(
    private readonly securityRepository: SecurityTypeormRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: LogoutUserCommand): Promise<boolean> {
    const { requestRefreshToken } = command;

    const decodedToken =
      await this.jwtService.verifyToken<JwtRefreshPayloadExtended>(
        requestRefreshToken,
      );

    if (!decodedToken) {
      throw new UnauthorizedException('Invalid or missing token payload.');
    }

    const isDeviceValid = await this.securityRepository.checkUserDeviceById(
      decodedToken?.userId,
      decodedToken?.deviceId,
    );

    if (!isDeviceValid) {
      throw new UnauthorizedException(
        'Device does not match the user or is invalid.',
      );
    }

    const isDeleted = await this.securityRepository.deleteUserDeviceById(
      decodedToken?.deviceId ?? "",
    );

    if (!isDeleted) {
      throw new Error('Failed to remove user device from repository.');
    }

    return true;
  }
}
