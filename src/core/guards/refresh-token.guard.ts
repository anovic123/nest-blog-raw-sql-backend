/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { RequestWithUser } from '../../base/types/request';

import { SecurityTypeormRepository } from 'src/features/security/infra/securite-typeorm.repository';

import { JwtService } from '../adapters/jwt-service';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private readonly securityRepository: SecurityTypeormRepository,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const refreshToken = request.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const refreshTokenData = await this.jwtService.getDataFromRefreshToken(
      refreshToken,
      this.securityRepository.findSessionByDeviceId.bind(
        this.securityRepository,
      ),
    );

    if (!refreshTokenData) {
      throw new UnauthorizedException();
    }

    const securitySession = await this.securityRepository.findSessionByDeviceId(
      refreshTokenData.deviceId,
    );

    const decodeTokenExp = this.jwtService.decodeToken(refreshToken);

    if (!decodeTokenExp.exp) {
      throw new UnauthorizedException();
    }
    if (
      securitySession?.exp !==
      new Date(decodeTokenExp.exp * 1000).toISOString()
    ) {
      throw new UnauthorizedException();
    }
    request.userId = refreshTokenData.userId;
    request.deviceId = refreshTokenData.deviceId;

    return true;
  }
}