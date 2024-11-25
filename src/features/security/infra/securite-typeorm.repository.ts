import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { AuthDevice, AuthDevicesDB } from "../domain/device.entity";
import { User } from "src/features/users/domain/users.entity";

@Injectable()
export class SecurityTypeormRepository {
  constructor(
    @InjectRepository(AuthDevice) 
      protected authDeviceRepository: Repository<AuthDevice>
  ) {}

  public async deleteUserDeviceById(deviceId: AuthDevice['device_id']): Promise<boolean> {
    const res = await this.authDeviceRepository.delete({
      device_id: deviceId
    })

    return res.affected !== undefined && res.affected !== null && res.affected > 0;
  }

  public async updateSessionUser(
    userId: User['id'],
    deviceId: AuthDevice['device_id'],
    refreshTokenExp: any
  ): Promise<boolean> {
    const res = await this.authDeviceRepository
    .createQueryBuilder('s')
    .update(AuthDevice)
    .set({
        exp: refreshTokenExp
    }).where("device_id = :device_id", {
      device_id: deviceId,
    })
    .andWhere("user_id = :user_id", {
      user_id: userId
    })
    .execute()

    return res.affected !== undefined && res.affected > 0;    
  }

  public async findSessionByDeviceId(deviceId: AuthDevice['device_id']): Promise<AuthDevice | null> {
    const session = await this.authDeviceRepository
      .createQueryBuilder('s')
      .where('s.device_id = :device_id', {
        device_id: deviceId
      })
      .getOne()

    return session || null;
  }

  public async checkUserDeviceById(
    userId: User['id'],
    device_id: AuthDevice['device_id']
  ): Promise<boolean> {
    const res = await this.authDeviceRepository
    .createQueryBuilder('s')
    .where('s.user_id = :user_id', {
      user_id: userId
    })
    .andWhere('s.device_id = :device_id', {
      device_id: device_id
    })
    .getOne()

    return !!res
  }

  public async deleteAllSessions(
    userId: User['id'],
    deviceId: AuthDevice['device_id']
  ): Promise<boolean> {
    const res = await this.authDeviceRepository
      .createQueryBuilder('s')
      .delete()
      .from(AuthDevice)
      .where('s.user_id = :userId', { userId })
      .andWhere('s.device_id != :deviceId', { deviceId })
      .execute();
  
    return res.affected !== undefined && res.affected !== null && res.affected > 0;
  }
  
  public async insertNewUserDevice(data: AuthDevice): Promise<boolean> {
    const newSession = AuthDevice.createUserDevice(data)

    const result = await this.authDeviceRepository.save(newSession)

    // const checkDeviceUser = await this.authDeviceRepository
    //   .createQueryBuilder('s')
    //   .where('s.user_id = :userId', { userId: result.id })
    //   .getOne()

    //   if (!checkDeviceUser) {
    //     throw new Error('Session was not created')
    //   }

    return true;
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