import { INestApplication } from "@nestjs/common";
import { createQuizTestingApp } from "./create-quiz-testing-app";
import { CreateQuestionUseCase } from "src/features/quiz/application/admin-use-cases/create-question.use-case";
import { createQuizQuestion1 } from "./datasets";

describe('create-question-use-case', () => {
  let app: INestApplication;
  let createQuestionUseCase: CreateQuestionUseCase;

  beforeAll(async () => {
    const { app: testingApp, moduleFixture } = await createQuizTestingApp();
    app = testingApp;
    createQuestionUseCase = moduleFixture.get<CreateQuestionUseCase>(CreateQuestionUseCase);
  });

  afterAll(async () => {
    await app.close();
  });

  it('create-question-use-case: 1 - should be defined', () => {
    expect(createQuestionUseCase).toBeDefined();
  });

  it('create-question-use-case: 2 - should create a question', async () => {
    const question = await createQuestionUseCase.execute(createQuizQuestion1);

    expect(question).toBeDefined();
    expect(question.correctAnswers).toHaveLength(createQuizQuestion1.body.correctAnswers.length);
    expect(question.body).toBe(createQuizQuestion1.body.body);
  })
});