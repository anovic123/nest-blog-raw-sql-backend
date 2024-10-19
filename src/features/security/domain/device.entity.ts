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
}