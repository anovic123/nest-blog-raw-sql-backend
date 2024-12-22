import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { AuthDevice, AuthDevicesDB } from '../domain/device.entity';
import { User } from 'src/features/users/domain/users.entity';

@Injectable()
export class SecurityRepository {
  constructor(
    @InjectDataSource()
    protected dataSource: DataSource,
  ) {}

  public async deleteUserDeviceById(deviceId: AuthDevice['device_id']) {
    const query = `
    DELETE FROM "devices"
    WHERE "device_id" = $1
    `

    const res = await this.dataSource.query(query, [deviceId])

    return !!res[1]
  }

  public async updateSessionUser(
    userId: User['id'],
    deviceId: AuthDevice['device_id'],
    refreshTokenExp: any
  ): Promise<void> {
    const query = `
    UPDATE "devices"
    SET "exp" = $1
    WHERE "device_id" = $2 AND "user_id" = $3
  `;

    await this.dataSource.query(query, [refreshTokenExp, deviceId, userId]);
  }

  public async findSessionByDeviceId(deviceId: AuthDevice['device_id']): Promise<
  AuthDevice | null> {
    const query = `
      SELECT * FROM "devices"
      WHERE "device_id" = $1
    `

    const res = await this.dataSource.query(query, [deviceId])
    return res.length ? res[0] : null;
  }

  public async insertNewUserDevice(data: AuthDevice): Promise<void> {
    const query = `
    INSERT INTO "devices" (id, user_id, device_id, ip, exp, device_name)
    VALUES ($1, $2, $3, $4, $5, $6)
  `;

    const { id, user_id, device_id, ip, exp, device_name } = data;

    await this.dataSource.query(query, [
      id,
      user_id,
      device_id,
      ip,
      exp,
      device_name
    ]);
  }

  public async deleteAllSessions(userId: User['id'], deviceId: AuthDevice['device_id']): Promise<boolean> {
    const query = `
    DELETE FROM "devices"
    WHERE "user_id" = $1
    AND "device_id" != $2
  `;

    const result = await this.dataSource.query(query, [userId, deviceId]);

    return result.rowCount > 0;
  }

  public async checkUserDeviceById(userId: User['id'], deviceId: AuthDevice['device_id']): Promise<boolean> {
    try {
      const query = `
      SELECT 1
      FROM "devices"
      WHERE "user_id" = $1 AND "device_id" = $2
      LIMIT 1
    `;

      const result = await this.dataSource.query(query, [userId, deviceId]);

      return result.length > 0;
    } catch (error) {
      console.error('Error in checkUserDeviceById:', error);
      return false;
    }
  }


  protected _mapDeviceDession(deviceSession: AuthDevicesDB) {
    return {
      deviceId: deviceSession.device_id,
      title: deviceSession.device_name,
      lastActiveDate: deviceSession.exp,
      ip: deviceSession.ip,
    }
  }
}