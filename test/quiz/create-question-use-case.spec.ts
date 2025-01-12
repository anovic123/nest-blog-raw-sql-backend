import { INestApplication } from "@nestjs/common"

import { createQuizTestingApp } from "./create-quiz-testing-app";

import { CreateQuestionUseCase } from "src/features/quiz/application/admin-use-cases/create-question.use-case";


describe('create-question-use-case', () => {
    let app: INestApplication;
    let createQuestionUseCase: CreateQuestionUseCase

    beforeAll(async () => {
      const { app: testingApp, moduleFixture } = await createQuizTestingApp();
      app = testingApp;
      createQuestionUseCase = moduleFixture.get<CreateQuestionUseCase>(CreateQuestionUseCase);
    })

    afterAll(async () => {
      await app.close();
    })

    it('should be defined', () => {
      expect(createQuestionUseCase).toBeDefined();
    })
})