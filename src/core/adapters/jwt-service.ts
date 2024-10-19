import jwt, { JwtPayload } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { SecurityRepository } from '../../features/security/infra/security.repository';
import { User } from '../../features/users/domain/users.entity';

export interface JwtPayloadExtended extends JwtPayload {
  userId: string;
}

export interface JwtRefreshPayloadExtended extends JwtPayload {
  userId: string;
  deviceId: string;
}

interface JwtTokensOutput {
  accessToken: string;
  refreshToken: string;
  refreshTokenExp: string;
}

@Injectable()
export class JwtService {
  private readonly JWT_SECRET: string;
  private readonly EXPIRES_ACCESS_TOKEN: string;
  private readonly EXPIRES_REFRESH_TOKEN: string;
  private readonly securityRepository: SecurityRepository;

  constructor(private readonly configService: ConfigService) {
    this.JWT_SECRET = this.configService.get('jwtSettings.JWT_SECRET', {
      infer: true,
    }) as unknown as string;
    this.EXPIRES_REFRESH_TOKEN = this.configService.get(
      'jwtSettings.EXPIRES_REFRESH_TOKEN',
      {
        infer: true,
      },
    ) as unknown as string;
    this.EXPIRES_ACCESS_TOKEN = this.configService.get(
      'jwtSettings.EXPIRES_ACCESS_TOKEN',
      {
        infer: true,
      },
    ) as unknown as string;
  }

  public async createJWT(
    userId: User['id'],
    deviceId: string = '0',
  ): Promise<JwtTokensOutput | null> {
    try {
      const accessToken = this._signAccessToken(userId);
      const refreshToken = this._signRefreshToken(userId, deviceId ?? uuidv4());

      const { exp: refreshTokenExp } = jwt.decode(refreshToken) as JwtPayload;

      if (!refreshTokenExp) {
        throw new HttpException(
          'Failed to create JWT',
          HttpStatus.UNAUTHORIZED,
        );
      }

      return {
        accessToken,
        refreshToken,
        refreshTokenExp: new Date(refreshTokenExp * 1000).toISOString(),
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: any) {
      return null;
    }
  }

  public _signAccessToken(userId: User['id']): string {
    return jwt.sign({ userId }, this.JWT_SECRET, {
      expiresIn: this.EXPIRES_ACCESS_TOKEN,
    });
  }

  public _signRefreshToken(userId: User['id'], deviceId: string): string {
    return jwt.sign({ userId, deviceId }, this.JWT_SECRET, {
      expiresIn: this.EXPIRES_REFRESH_TOKEN,
    });
  }

  public decodeToken = (token: string) => {
    return jwt.decode(token) as JwtPayload;
  };

  public async verifyToken<T extends JwtPayload>(
    token: string,
  ): Promise<T | null> {
    try {
      const decodedToken = jwt.verify(token, this.JWT_SECRET) as T;

      return decodedToken;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }
  public async getDataFromRefreshToken(
    refreshToken: string,
    findSessionByDeviceId: (deviceId: string) => Promise<any | null>,
  ): Promise<{ userId: string; deviceId: string } | null> {
    const decodedRefresh =
      await this.verifyToken<JwtRefreshPayloadExtended>(refreshToken);
    if (!decodedRefresh) return null;

    console.log(decodedRefresh);
    const deviceData = await findSessionByDeviceId(decodedRefresh.deviceId);
    if (!deviceData) return null;

    const isTokenExpired =
      decodedRefresh.exp &&
      new Date(decodedRefresh.exp * 1000) < new Date(deviceData.lastActiveDate);
    if (isTokenExpired) return null;

    return { userId: decodedRefresh.userId, deviceId: decodedRefresh.deviceId };
  }
}