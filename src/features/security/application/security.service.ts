import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';

import { JwtService } from '../../../core/adapters/jwt-service';

import { SecurityTypeormRepository } from '../infra/securite-typeorm.repository';
import { SecurityTypeormQueryRepository } from '../infra/securite-typeorm.query.repository';

@Injectable()
export class SecurityService {
  constructor(
    private readonly securityRepository: SecurityTypeormRepository,
    private readonly jwtService: JwtService,
    private readonly securityQueryRepository: SecurityTypeormQueryRepository,
  ) {}

  public async deleteSessionById(userId: string, deviceId: string) {
    const findDevice =
      await this.securityRepository.findSessionByDeviceId(deviceId);

    if (!findDevice) {
      throw new NotFoundException();
    }

    const checkDeviceUser = await this.securityRepository.checkUserDeviceById(
      userId,
      deviceId,
    );

    if (!checkDeviceUser) {
      throw new HttpException('session', HttpStatus.FORBIDDEN);
    }

    await this.securityRepository.deleteUserDeviceById(deviceId);
  }

  public async deleteAllSessions(userId: string, deviceId: string) {
    await this.securityRepository.deleteAllSessions(userId, deviceId);
  }

  public async getAllDevicesSessions(userId: string) {
    return this.securityQueryRepository.findSessionsByUserId(userId);
  }
}