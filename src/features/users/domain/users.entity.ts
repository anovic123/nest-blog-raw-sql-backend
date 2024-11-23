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

  static createUser(user: Omit<User, 'isConfirmed'>): User {
    const newUser = new User()

    const { confirmationCode, createdAt, email, expirationDate, id, login, passwordHash } = user

    newUser.id = id,
    newUser.email = email,
    newUser.passwordHash = passwordHash,
    newUser.expirationDate = expirationDate,
    newUser.createdAt = createdAt,
    newUser.login = login,
    newUser.confirmationCode = confirmationCode
    newUser.isConfirmed = false

    return newUser
  }
}