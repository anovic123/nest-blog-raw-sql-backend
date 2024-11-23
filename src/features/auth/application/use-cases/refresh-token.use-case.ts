import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { SecurityTypeormRepository } from 'src/features/security/infra/securite-typeorm.repository';

import {
  JwtRefreshPayloadExtended,
  JwtService,
} from 'src/core/adapters/jwt-service';
import { UnauthorizedException } from '@nestjs/common';

export class RefreshTokenCommand {
  constructor(public readonly requestRefreshToken: string) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase
  implements ICommandHandler<RefreshTokenCommand>
{
  constructor(
    private readonly securityRepository: SecurityTypeormRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<{
    accessToken: string;
    refreshToken: string;
    refreshTokenExp: any;
  }> {
    const { requestRefreshToken } = command;

    const decodedToken =
      await this.jwtService.verifyToken<JwtRefreshPayloadExtended>(
        requestRefreshToken,
      );

    if (!decodedToken) {
      throw new UnauthorizedException();
    }

    const { deviceId, exp: decodedExp } = decodedToken;

    const deviceData =
      await this.securityRepository.findSessionByDeviceId(deviceId);

    if (!deviceData) {
      throw new UnauthorizedException('Session not found');
    }

    if (
      deviceData?.exp !== new Date(decodedExp! * 1000).toISOString()
    ) {
      throw new UnauthorizedException();
    }

    const isTokenExpired =
      decodedExp &&
      new Date(decodedExp * 1000) < new Date(deviceData.exp);

    if (isTokenExpired) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    const newAccessToken = this.jwtService._signAccessToken(
      decodedToken.userId,
    );
    const newRefreshToken = this.jwtService._signRefreshToken(
      decodedToken.userId,
      deviceId,
    );

    const { exp: newRefreshTokenExp } =
      this.jwtService.decodeToken(newRefreshToken);

    if (!newRefreshTokenExp) {
      throw new UnauthorizedException('Failed to generate new refresh token');
    }

    await this.securityRepository.updateSessionUser(
      decodedToken.userId,
      deviceId,
      new Date(newRefreshTokenExp * 1000).toISOString(),
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      refreshTokenExp: new Date(newRefreshTokenExp * 1000).toISOString(),
    };
  }
}