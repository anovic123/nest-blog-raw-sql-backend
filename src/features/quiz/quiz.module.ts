import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { QuizController } from "./api/quiz.controller";

import { QuizTypeormQueryRepository } from "./infra/quiz-typeorm-query.repository";
import { QuizTypeormRepository } from "./infra/quiz-typeorm.repository";

import { QuizAnswers } from "./domain/quiz-answers.entity";
import { QuizGameQuestion } from "./domain/quiz-game-question.entity";
import { QuizGameQuestions } from "./domain/quiz-game-questions.entity";
import { QuizGame } from "./domain/quiz-games.entity";
import { QuizPlayer } from "./domain/quiz-player.entity";
import { QuizUsers } from "./domain/quiz-users.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QuizAnswers,
      QuizGameQuestion,
      QuizGameQuestions,
      QuizGame,
      QuizPlayer,
      QuizUsers
    ])
  ],
  controllers: [
    QuizController
  ],
  providers: [
    QuizTypeormQueryRepository,
    QuizTypeormRepository
  ],
  exports: []
})
export class QuizModule {}