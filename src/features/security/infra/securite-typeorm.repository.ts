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
      .createQueryBuilder('authDevice')
      .where('authDevice.device_id = :device_id', { device_id: deviceId })
      .getOne();

    return session || null;
  }

  public async checkUserDeviceById(
    userId: User['id'],
    device_id: AuthDevice['device_id']
  ): Promise<boolean> {
    if (!userId || !device_id) {
      throw new Error('Invalid userId or device_id');
    }
  
    const res = await this.authDeviceRepository
      .createQueryBuilder('authDevice')
      .where('authDevice.user_id = :user_id', { user_id: userId })
      .andWhere('authDevice.device_id = :device_id', { device_id })
      .getOne();
  
    return !!res;
  }  

  public async deleteAllSessions(
    userId: User['id'],
    deviceId: AuthDevice['device_id']
  ): Promise<boolean> {
    try {
      const res = await this.authDeviceRepository
        .createQueryBuilder()
        .delete()
        .from(AuthDevice)
        .where('user_id = :userId', { userId })
        .andWhere('device_id != :deviceId', { deviceId })
        .execute();
  
      return res.affected !== undefined && res.affected !== null && res.affected > 0;
    } catch (error) {
      console.error(`Error deleting sessions for userId: ${userId}`, error);
      return false;
    }
  }  
  
  public async insertNewUserDevice(data: AuthDevice): Promise<boolean> {
    const newSession = AuthDevice.createUserDevice(data)

    const result = await this.authDeviceRepository.save(newSession)

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