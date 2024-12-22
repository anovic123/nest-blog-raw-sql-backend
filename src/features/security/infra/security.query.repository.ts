import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { User } from 'src/features/users/domain/users.entity';
import { AuthDevicesDB } from '../domain/device.entity';

import { DevicesSessionViewModel } from '../api/models/output.model';

@Injectable()
export class SecurityQueryRepository {
  constructor(
     @InjectDataSource()
    protected dataSource: DataSource,
  ) {}

  public async findSessionsByUserId(id: User['id']): Promise<DevicesSessionViewModel[]> {

    const query = `
      SELECT * from "devices"
      WHERE "user_id" = $1
    `

    const res = await this.dataSource.query(query, [id])

    return res.map(this.mapOutput)
  }

  public mapOutput(s: AuthDevicesDB): DevicesSessionViewModel {
    return {
      ip: s.ip,
      title: s.device_name,
      lastActiveDate: s.exp,
      deviceId: s.device_id,
    };
  }
}