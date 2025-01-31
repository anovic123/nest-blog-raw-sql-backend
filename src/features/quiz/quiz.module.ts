import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CqrsModule } from "@nestjs/cqrs";

import { QuizAdminController } from "./api/quiz-admin.controller";
import { QuizPairsGameController } from "./api/quiz-pairs-game.controller";

import { SaQuizTypeormQueryRepository } from "./infra/sa-quiz-typeorm-query.repository";
import { SaQuizTypeormRepository } from "./infra/sa-quiz-typeorm.repository";
import { QuizGameTypeormQueryRepository } from "./infra/quiz-game-typeorm-query.repository";
import { QuizGameTypeormRepository } from "./infra/quiz-game-typeorm.repository";
import { UsersTypeormRepository } from "../users/infra/users-typeorm.repository";
import { QuizPlayerTypeormRepository } from "./infra/quiz-player-typeorm.repository";
import { QuizTypeormRepository } from "./infra/quiz-typeorm.repository";

import { QuizAnswers } from "./domain/quiz-answers.entity";
import { QuizGameQuestion } from "./domain/quiz-game-question.entity";
import { QuizGameQuestions } from "./domain/quiz-game-questions.entity";
import { QuizGame } from "./domain/quiz-games.entity";
import { QuizPlayer } from "./domain/quiz-player.entity";
import { QuizUsers } from "./domain/quiz-users.entity";
import { User } from "../users/domain/users.entity";

import { CreateQuestionUseCase } from "./application/admin-use-cases/create-question.use-case";
import { DeleteQuestionUseCase } from "./application/admin-use-cases/delete-question.use-case";
import { UpdateQuestionUseCase } from "./application/admin-use-cases/update-question.use-case";
import { PublishQuestionUseCase } from "./application/admin-use-cases/publish-question.use-case";
import { CreateGameUseCase } from "./application/pairs-use-cases/create-game.use-case";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QuizAnswers,
      QuizGameQuestion,
      QuizGameQuestions,
      QuizGame,
      QuizPlayer,
      QuizUsers,
      User
    ]),
    CqrsModule
  ],
  controllers: [
    QuizAdminController,
    QuizPairsGameController
  ],
  providers: [
    CreateQuestionUseCase,
    DeleteQuestionUseCase,
    UpdateQuestionUseCase,
    PublishQuestionUseCase,
    CreateGameUseCase,
    QuizGameTypeormRepository,
    SaQuizTypeormQueryRepository,
    SaQuizTypeormRepository,
    UsersTypeormRepository,
    QuizPlayerTypeormRepository,
    QuizTypeormRepository,
    QuizGameTypeormQueryRepository
  ],
  exports: []
})
export class QuizModule {}