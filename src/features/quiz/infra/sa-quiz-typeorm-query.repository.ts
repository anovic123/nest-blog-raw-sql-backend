import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

import { QuizGameQuestions } from "../domain/quiz-game-questions.entity";
import { PaginationOutput, PaginationQuestions } from "src/base/models/pagination.base.model";
import { QuestionViewDto } from "../api/models/output/question.view-dto";

@Injectable()
export class SaQuizTypeormQueryRepository {
  constructor (
    @InjectRepository(QuizGameQuestions) private readonly saQuizGameQuestionsRepo: Repository<QuizGameQuestions>
  ) {}

  async getQuizQuestions(pagination: PaginationQuestions) {
  console.log("🚀 ~ QuizTypeormQueryRepository ~ pagination:", pagination)
  }
}