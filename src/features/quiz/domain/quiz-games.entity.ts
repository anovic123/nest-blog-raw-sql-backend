import { Entity, OneToMany, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne, JoinTable } from 'typeorm';
import { QuizPlayer } from './quiz-player.entity';
import { QuizGameQuestions } from './quiz-game-questions.entity';

export enum GameStatus {
  Pending = 'Pending',
  Active = 'Active',
  Finished = 'Finished',
}

@Entity('quiz-games')
export class QuizGame {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: 'enum', enum: GameStatus })
  status: GameStatus;

  @Column()
  pairCreatedDate: Date;

  @Column({ nullable: true })
  startGameDate: Date;

  @Column({ nullable: true })
  finishGameDate: Date;

  @OneToOne(() => QuizPlayer, (p) => p.game, { onDelete: 'CASCADE' })
  @JoinColumn()
  firstPlayer: QuizPlayer
  @Column({ type: 'uuid' })
  firstPlayerId: string;

  @OneToOne(() => QuizPlayer, (p) => p.game, { nullable: true })
  @JoinColumn()
  secondPlayer: QuizPlayer | null;
  @Column({ type: 'uuid', nullable: true })
  secondPlayerId: string;

  @OneToMany(() => QuizGameQuestions, (qgq) => qgq.game, { cascade: true })
  @JoinTable()
  questions: QuizGameQuestions[];
}
