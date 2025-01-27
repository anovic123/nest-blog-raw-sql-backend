import { CreateQuestionCommand } from "src/features/quiz/application/admin-use-cases/create-question.use-case";

export const createQuizQuestion1: CreateQuestionCommand = {
  body: {
    body: 'How many continents are there?',
    correctAnswers: ['6', '5', '3']
  }
}