import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: "varchar", nullable: false })
  email: string;

  @Column({ type: "varchar", nullable: false })
  login: string;

  @Column({ type: "varchar", nullable: false })
  passwordHash: string;

  @Column({ type: "boolean", nullable: false, default: false })
  isConfirmed: boolean;

  @Column({ type: "varchar", nullable: false })
  confirmationCode: string;

  @Column({ type: "varchar", nullable: false})
  expirationDate: Date;

  @CreateDateColumn()
  createdAt: Date;
}