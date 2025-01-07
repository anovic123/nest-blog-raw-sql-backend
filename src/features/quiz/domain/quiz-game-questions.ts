import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { QuizGame } from "./quiz-games.entity";
import { QuizGameQuestion } from "./quiz-game-question";

@Entity('quiz-game-questions')
export class QuizGameQuestions {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => QuizGame, (gq) => gq.questions)
  game: QuizGame

  @ManyToOne(() => QuizGameQuestion, (qgq) => qgq.games)
  question: QuizGameQuestion
}