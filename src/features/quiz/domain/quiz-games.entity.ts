import { Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Column } from 'typeorm';
import { QuizPlayer } from './quiz-player.entity';
import { QuizGameQuestions } from './quiz-game-questions.entity';

@Entity('quiz-games')
export class QuizGame {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ['Pending', 'Active', 'Finished'] })
  status: 'Pending' | 'Active' | 'Finished';

  @ManyToOne(() => QuizPlayer)
  player1: QuizPlayer;

  @ManyToOne(() => QuizPlayer)
  player2: QuizPlayer;

  @OneToMany(() => QuizGameQuestions, (qgq) => qgq.game, { cascade: true })
  questions: QuizGameQuestions[];
}
