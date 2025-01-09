import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { QuizGame } from './quiz-games.entity';
import { QuizGameQuestion } from './quiz-game-question.entity';

@Entity('quiz-game-questions')
export class QuizGameQuestions {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => QuizGame, (game) => game.questions)
  game: QuizGame;

  @ManyToOne(() => QuizGameQuestion, (question) => question.games)
  question: QuizGameQuestion;
}
