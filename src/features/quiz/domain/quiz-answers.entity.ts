import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { QuizPlayer } from "./quiz-player.entity";

@Entity('quiz-answers')
export class QuizAnswers {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  questionId: number

  // TODO: maybe change to qp.user
  @ManyToOne(() => QuizPlayer, (qp) => qp.answers)
  player: QuizPlayer

  @Column({ type: 'text' })
  status: 'Correct' | 'Incorrect'

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;
}