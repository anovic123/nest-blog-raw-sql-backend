import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { User } from 'src/features/users/domain/users.entity';
import { Answer } from './answer.entity';
import { PlayerStatus } from '../api/models/enums/player-status';

@Entity({ name: 'players' })
export class Player {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (u) => u.players)
  user: User;

  @Column({ default: 0 })
  score: number;

  @OneToMany(() => Answer, (a) => a.player)
  answers: Answer[];

  @Column({ default: null })
  playerStatus: PlayerStatus;

  static create(userId: string): Player {
    const player = new Player();
    player.user = { id: userId } as User;
    return player;
  }
}
