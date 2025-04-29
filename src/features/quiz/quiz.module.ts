import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CqrsModule } from "@nestjs/cqrs";

import { Player } from "./domain/player.entity";
import { Answer } from "./domain/answer.entity";
import { Game } from "./domain/game.entity";
import { GameQuestion } from "./domain/game.question.entity";
import { Question } from "./domain/question.entity";

import { QuizSaController } from "./api/controllers/quiz.sa.controller";
import { PairGameQuizController } from "./api/controllers/pair.game.quiz.controller";

import { QuestionsRepository } from "./infra/questions.repository";
import { GameRepository } from "./infra/game.repository";
import { GameQueryRepository } from "./infra/game.query-repository";
import { QuestionsQueryRepository } from "./infra/questions.query-repository";
import { UsersRepository } from "../users/infra/users.repository";

import { GameExpirationCron } from "./application/cron/game-expiration-cron.cron";

import { CreateQuestionUseCase } from "./application/use-cases/questions/create-question.use-case";
import { DeleteQuestionUseCase } from "./application/use-cases/questions/delete-question.use-case";
import { UpdateQuestionUseCase } from "./application/use-cases/questions/update-question.use-case";
import { UpdatePublishQuestionUseCase } from "./application/use-cases/questions/update-publish-question.use-case";

import { ConnectionToGameUseCase } from "./application/use-cases/game/connection-to-game.use-case";
import { IsGameExistsAndUserParticipantUseCase } from "./application/use-cases/game/is-game-exists-and-user-participant.use-case";
import { GetCurrentGameIdUseCase } from "./application/use-cases/game/get-current-game-id.use-case";
import { FinishExpiredGamesUseCase } from "./application/use-cases/game/finish-expired-games.use-case";
import { CheckTheAnswersUseCase } from "./application/use-cases/game/check-the-answers.use-case";

const useCasesForQuestion = [
  CreateQuestionUseCase,
  DeleteQuestionUseCase,
  UpdateQuestionUseCase,
  UpdatePublishQuestionUseCase,
];

const useCasesForGame = [
  ConnectionToGameUseCase,
  CheckTheAnswersUseCase,
  IsGameExistsAndUserParticipantUseCase,
  GetCurrentGameIdUseCase,
  FinishExpiredGamesUseCase,
];

const repositories = [
  UsersRepository,
  QuestionsRepository,
  GameRepository,
]

const queryRepositories = [
  GameQueryRepository,
  QuestionsQueryRepository
]

const cron = [
  GameExpirationCron
]

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Player,
      Answer,
      Game,
      GameQuestion,
      Question
    ]),
    CqrsModule
  ],
  controllers: [
    QuizSaController,
    PairGameQuizController
  ],
  providers: [
    ...useCasesForQuestion,
    ...useCasesForGame,
    ...repositories,
    ...queryRepositories,
    ...cron
  ],
  exports: []
})
export class QuizModule {}
