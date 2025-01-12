import { ApiProperty } from "@nestjs/swagger";
import { QuizGameQuestion } from "src/features/quiz/domain/quiz-game-question.entity";


export enum QuestionPublishedStatus {
  ALL = 'all',
  PUBLISHED = 'published',
  NOT_PUBLISHED = 'notPublished'
}

export class QuestionViewDto {
  @ApiProperty({
    description: "id"
  })
  id: string
  @ApiProperty({
    description: "body",
    example: "Text of questions, for example: How many continents are there?"
  })
  body: string
  @ApiProperty({
    description: "correct answers",
    example: "['6', '5', '3']"
  })
  correctAnswers: string[]
  @ApiProperty({
    description: "if question is completed and can be used in th Quiz game",
    default: false
  })
  published: boolean
  @ApiProperty({
    description: "createdAt"
  })
  createdAt: string
  @ApiProperty({
    description: "updatedAt"
  })
  updatedAt: string

  static mapToView(question: QuizGameQuestion): QuestionViewDto {
    return {
      id: question.id,
      body: question.body,
      correctAnswers: question.correctAnswers,
      published: question.published,
      createdAt: question.createdAt.toISOString(),
      updatedAt: question.updatedAt.toISOString()
    }
  }
}