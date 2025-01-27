import { INestApplication, NotFoundException } from "@nestjs/common";

import { createQuizTestingApp } from "./create-quiz-testing-app";

import { CreateQuestionCommand, CreateQuestionUseCase } from "./../../src/features/quiz/application/admin-use-cases/create-question.use-case";
import { DeleteQuestionCommand, DeleteQuestionUseCase } from "src/features/quiz/application/admin-use-cases/delete-question.use-case";

import { createQuizQuestion1 } from "./datasets";

describe('delete-question-use-case', () => {
  let app: INestApplication;
  let deleteQuestionUseCase: DeleteQuestionUseCase;
  let createQuestionUseCase: CreateQuestionUseCase;

  let questionId1: string;
  let questionId2: string;

  beforeAll(async () => {
    const { app: testingApp, moduleFixture } = await createQuizTestingApp();
    app = testingApp;
    createQuestionUseCase = moduleFixture.get<CreateQuestionUseCase>(CreateQuestionUseCase);
    deleteQuestionUseCase = moduleFixture.get<DeleteQuestionUseCase>(DeleteQuestionUseCase);
  });

  afterAll(async () => {
    await app.close();
  });

  it('delete-question-use-case: 1 - should be defined', () => {
    expect(createQuestionUseCase).toBeDefined();
  })

  it('delete-question-use-case: 2 - should delete a question', async () => {
    const question = await createQuestionUseCase.execute(createQuizQuestion1);

    expect(question).toBeDefined();
    expect(question.correctAnswers).toHaveLength(createQuizQuestion1.body.correctAnswers.length);
    
    const deleteQuestion = await deleteQuestionUseCase.execute(new DeleteQuestionCommand(question.id));
    expect(deleteQuestion).toBeUndefined();
  })

  it('delete-question-use-case: 3 - should not delete a question', async () => {
    const question = await createQuestionUseCase.execute(createQuizQuestion1);

    expect(question).toBeDefined();
    expect(question.correctAnswers).toHaveLength(createQuizQuestion1.body.correctAnswers.length);
    
    const deleteQuestion = await deleteQuestionUseCase.execute(new DeleteQuestionCommand(question.id));
    expect(deleteQuestion).toBeUndefined();

    await expect(deleteQuestionUseCase.execute(new DeleteQuestionCommand(question.id))).rejects.toThrow(NotFoundException)
  })
});