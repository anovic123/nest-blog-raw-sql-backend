import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { QuizPlayer } from "./quiz-player.entity";

@Entity('quiz-answers')
export class QuizAnswers {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  questionId: number

  // TODO: maybe change to qp.user
  @ManyToOne(() => QuizPlayer, (qp) => qp.answers)
  player: QuizPlayer

  @Column({ type: 'enum', enum: ['Correct', 'Incorrect'] })
  status: 'Correct' | 'Incorrect'

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;
}