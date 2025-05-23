import { Column, Entity, OneToMany } from 'typeorm';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';

import { BaseEntity } from "../../../core/entities/base.entity";
import { Player } from 'src/features/quiz/domain/player.entity';

@Entity('users')
export class User extends BaseEntity {
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

  @OneToMany(() => Player, (p) => p.user)
  players: Player[];

  static createUser(login: User['login'], passwordHash: User['passwordHash'], email: User['email']): User {
    const newUser = new User()

    newUser.id = randomUUID(),
    newUser.email = email,
    newUser.passwordHash = passwordHash,
    newUser.expirationDate = add(new Date(), {
      hours: 1,
      minutes: 3
    }),
    newUser.createdAt = new Date(),
    newUser.login = login,
    newUser.confirmationCode = randomUUID()
    newUser.isConfirmed = false

    return newUser
  }
}