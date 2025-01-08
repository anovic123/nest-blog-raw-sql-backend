import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { QuizGameQuestions } from "./quiz-game-questions";

@Entity('quiz-game-question')
export class QuizGameQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  body: string;

  @OneToMany(() => QuizGameQuestions, (qgq) => qgq.question)
  games: QuizGameQuestions[];
}