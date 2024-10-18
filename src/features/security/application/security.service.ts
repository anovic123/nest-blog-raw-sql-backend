import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';

import { JwtService } from '../../../core/adapters/jwt-service';

import { SecurityRepository } from '../infra/security.repository';
import { SecurityQueryRepository } from '../infra/security.query.repository';

@Injectable()
export class SecurityService {
  constructor(
    private readonly securityRepository: SecurityRepository,
    private readonly jwtService: JwtService,
    private readonly securityQueryRepository: SecurityQueryRepository,
  ) {}

  public async getUserByDeviceId(deviceId: string) {
    return this.securityRepository.findSessionByDeviceId(deviceId);
  }

  public async deleteSessionById(userId: string, deviceId: string) {
    const findDevice =
      await this.securityRepository.findSessionByDeviceId(deviceId);

    if (!findDevice) {
      throw new NotFoundException();
    }

    const checkDeviceUser = await this.securityRepository.checkUserDeviceById(
      +userId,
      deviceId,
    );

    if (!checkDeviceUser) {
      throw new HttpException('session', HttpStatus.FORBIDDEN);
    }

    await this.securityRepository.deleteUserDeviceById(deviceId);
  }

  public async deleteAllSessions(userId: string, deviceId: string) {
    await this.securityRepository.deleteAllSessions(+userId, deviceId);
  }

  public async getAllDevicesSessions(userId: string, deviceId: string) {
    return this.securityQueryRepository.findSessionsByUserId(+userId);
  }
}