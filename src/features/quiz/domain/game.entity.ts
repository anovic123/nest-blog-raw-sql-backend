import { Column, Entity, Index, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from '@core/entities/base.entity';
import { GameStatus } from '../api/models/enums/game-status';
import { Player } from './player.entity';
import { GameQuestion } from './game.question.entity';

@Entity({ name: 'games' })
export class Game extends BaseEntity {
  @Column()
  status: GameStatus;

  @OneToOne(() => Player)
  @JoinColumn({ name: 'player_1_id' })
  player_1: Player;

  @OneToOne(() => Player)
  @JoinColumn({ name: 'player_2_id' })
  player_2: Player;

  @OneToMany(() => GameQuestion, (q) => q.game)
  questions: GameQuestion[];

  @Column({ type: 'timestamptz', nullable: true })
  startGameDate?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  finishGameDate?: Date;

  static createPendingGame(firstPlayerId: string): Game {
    const pendingGame = new Game();
    pendingGame.status = GameStatus.Pending;
    pendingGame.player_1 = { id: firstPlayerId } as Player;
    return pendingGame;
  }
}
