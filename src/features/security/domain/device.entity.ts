import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export class AuthDevicesDB {
  id: number;
  user_id: number;
  device_id: string;
  ip: string;
  exp: string;
  device_name: string;
}

@Entity('devices')
export class AuthDevice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "integer", nullable: false })
  user_id: string

  @Column({ type: "varchar", nullable: false })
  device_id: string;

  @Column({ type: "varchar", nullable: false })
  ip: string;

  @Column({ type: "varchar", nullable: false })
  exp: string;

  @Column({ type: "varchar", nullable: false })
  device_name: string;
}