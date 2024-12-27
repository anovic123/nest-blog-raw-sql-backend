import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from 'src/features/users/domain/users.entity';
import { AuthDevice } from '../domain/device.entity';

import { DevicesSessionViewModel } from '../api/models/output.model';

@Injectable()
export class SecurityTypeormQueryRepository {
  constructor(
    @InjectRepository(AuthDevice) 
    protected securityRepository: Repository<AuthDevice>
  ) {}

  public async findSessionsByUserId(id: User['id']): Promise<DevicesSessionViewModel[]> {
    const res = await this.securityRepository.
      createQueryBuilder('s')
      .select(['s.ip', 's.device_name', 's.exp', 's.device_id'])
      .where("s.user_id = :id", { id })
      .getMany()

      return res.map(s => this.mapSessionOutput(s))
  }

  public mapSessionOutput(session: AuthDevice): DevicesSessionViewModel {
    return {
      ip: session?.ip,
      title: session?.device_name,
      lastActiveDate: session?.exp,
      deviceId: session?.device_id,
    }
  }
}