import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

import { QuizGameQuestions } from "../domain/quiz-game-questions.entity";

import { PaginationOutput, PaginationQuestions } from "src/base/models/pagination.base.model";

import { PaginatedResponse } from "src/base/types/pagination";

import { QuestionViewDto } from "../api/models/output/question.view-dto";

@Injectable()
export class SaQuizTypeormQueryRepository {
  constructor (
    private readonly dataSource: DataSource,
    // private readonly 
  ) {}

  public async getQuizQuestions(pagination: PaginationQuestions): Promise<PaginatedResponse<QuestionViewDto>> {

    const publishedStatus = PaginationQuestions.getQuizQuestions(pagination.publishedStatus);
    const bodySearchTerm = pagination.bodySearchTerm ? `%${pagination.bodySearchTerm}%` : null;

    const sortedQuestions = await this.dataSource.query(`
      SELECT * FROM "quiz-game-question" 
      WHERE ("body" ILIKE $1 OR $1 IS NULL) 
      AND ("published" = $2 OR $2 IS NULL) 
      AND ("deletedAt" IS NULL)
      GROUP BY "id", "body", "correctAnswers", "published", "createdAt", "updatedAt"
      ORDER BY "${pagination.sortBy}" ${pagination.sortDirection}
      LIMIT $3 OFFSET $4
      `,
    [
      bodySearchTerm,
      publishedStatus,
      pagination.pageSize,
      pagination.getSkipItemsCount()
    ]);

    const totalCountQuery = `
      SELECT COUNT(*) FROM "quiz-game-question" 
      WHERE ("body" ILIKE $1 OR $1 IS NULL) 
      AND ("published" = $2 OR $2 IS NULL) 
      AND ("deletedAt" IS NULL)
    `;

    const totalCountRes = await this.dataSource.query(totalCountQuery, [
      bodySearchTerm,
      publishedStatus
    ]);
    const totalCount = parseInt(totalCountRes[0].count, 10);

    return {
      pagesCount: Math.ceil(totalCount / pagination.pageSize),
      page: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalCount,
      items: sortedQuestions.map(q => QuestionViewDto.mapToView(q))
    };
  }

  public async getActiveOrPendingQuizGame(userId: string) {

  }
}