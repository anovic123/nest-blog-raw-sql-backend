import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CreateQuestionUseCase } from 'src/features/quiz/application/admin-use-cases/create-question.use-case';
import { DeleteQuestionUseCase } from 'src/features/quiz/application/admin-use-cases/delete-question.use-case';
import { PublishQuestionUseCase } from 'src/features/quiz/application/admin-use-cases/publish-question.use-case';
import { UpdateQuestionUseCase } from 'src/features/quiz/application/admin-use-cases/update-question.use-case';

import { QuizAnswers } from 'src/features/quiz/domain/quiz-answers.entity';
import { QuizGameQuestion } from 'src/features/quiz/domain/quiz-game-question.entity';
import { QuizGameQuestions } from 'src/features/quiz/domain/quiz-game-questions.entity';
import { QuizGame } from 'src/features/quiz/domain/quiz-games.entity';
import { QuizPlayer } from 'src/features/quiz/domain/quiz-player.entity';
import { QuizUsers } from 'src/features/quiz/domain/quiz-users.entity';

import { SaQuizTypeormRepository } from 'src/features/quiz/infra/sa-quiz-typeorm.repository';

export async function createQuizTestingApp() {
  const moduleFixture = await Test.createTestingModule({
    imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'postgres',
          password: 'postgres',
          database: 'test_db',
          dropSchema: true,
          synchronize: true,
          entities: [
            QuizAnswers,
            QuizGameQuestion,
            QuizGameQuestions,
            QuizGame,
            QuizPlayer,
            QuizUsers
          ],
        }),
        TypeOrmModule.forFeature([      
            QuizAnswers,
            QuizGameQuestion,
            QuizGameQuestions,
            QuizGame,
            QuizPlayer,
            QuizUsers
        ]),
    ],
    providers: [ SaQuizTypeormRepository, SaQuizTypeormRepository, CreateQuestionUseCase, DeleteQuestionUseCase, PublishQuestionUseCase, UpdateQuestionUseCase ]
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();

  return { app, moduleFixture }
}