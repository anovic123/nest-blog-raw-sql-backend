import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { QuizGameQuestions } from "../domain/quiz-game-questions.entity";
import { QuizGameQuestion } from "../domain/quiz-game-question.entity";
import { AddQuestionsToGameDto } from "../api/models/dto/add-questions-to-game.dto";

@Injectable()
export class QuizTypeormRepository {
  constructor(
    @InjectRepository(QuizGameQuestions)
    private readonly quizGameQuestionsRepository: Repository<QuizGameQuestions>,
    @InjectRepository(QuizGameQuestion)
    private readonly quizGameQuestionRepository: Repository<QuizGameQuestion>
  ) {}

  async getFiveQuestionsId() {
    const questions = await this.quizGameQuestionsRepository.createQueryBuilder('q').select('q.id').limit(5).getRawMany();

    return questions
  }

  async createFiveGameQuestions(dto: AddQuestionsToGameDto) {
    let questionNumber = 1


    for (const questionId of dto.questionsId) {
      await this.quizGameQuestionsRepository.createQueryBuilder('q').insert().values({
        questionId,
        gameId: dto.gameId,
        questionNumber
      }).execute()

      questionNumber++
    }
  }
}