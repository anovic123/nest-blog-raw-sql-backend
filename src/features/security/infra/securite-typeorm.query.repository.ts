import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../users/domain/users.entity';
import { AuthDevice } from '../domain/device.entity';

@Injectable()
export class SecurityTypeormQueryRepository {
  constructor(
    @InjectRepository(AuthDevice) 
    protected securityRepository: Repository<AuthDevice>
  ) {}

  public async findSessionsByUserId(id: User['id']): Promise<AuthDevice[]> {
    const res = await this.securityRepository.
      createQueryBuilder('s')
      .select(['s.ip', 's.title', 's.lastActiveDate', 's.deviceId'])
      .where("s.user_id = :id", { id })
      .getMany()

    return res
  }
}