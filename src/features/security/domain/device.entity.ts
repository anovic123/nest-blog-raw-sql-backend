import { Column, Entity, PrimaryColumn } from 'typeorm';

export class AuthDevicesDB {
  id: string;
  user_id: number;
  device_id: string;
  ip: string;
  exp: string;
  device_name: string;
}

@Entity('devices')
export class AuthDevice {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: "varchar", nullable: false })
  user_id: string

  @Column({ type: "varchar", nullable: false })
  device_id: string;

  @Column({ type: "varchar", nullable: false })
  ip: string;

  @Column({ type: "varchar", nullable: false })
  exp: string;

  @Column({ type: "varchar", nullable: false })
  device_name: string;

  static createUserDevice(session: AuthDevice) {
    const newUserDevice = new AuthDevice()

    const { 
      device_id,
      device_name,
      exp,
      id,
      ip,
      user_id
     } = session

     newUserDevice.id = id
     newUserDevice.device_id = device_id
     newUserDevice.exp = exp
     newUserDevice.device_name = device_name
     newUserDevice.ip = ip
     newUserDevice.user_id = user_id

     return newUserDevice
  }
}