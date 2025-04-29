import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Question } from "../domain/question.entity";

import { PublishedStatus } from "../api/models/enums/published-status";

import { PaginationQuestionInputModel } from "../api/models/input/pagination.question.input.model";
import { paginationModelMapper } from "src/base/models/pagination.output.model";
import { QuestionViewModel } from "../api/models/output/question/question.view.model";

@Injectable()
export class QuestionsQueryRepository {
  constructor(
    @InjectRepository(Question)
    private readonly questionsRepository: Repository<Question>,
  ) {}

  public async getAll(queryDto: PaginationQuestionInputModel) {
    const limit = queryDto.pageSize;
    const offset = (queryDto.pageNumber - 1) * queryDto.pageSize;
    const bodySearchTerm = queryDto.bodySearchTerm
      ? `%${queryDto.bodySearchTerm}%`
      : '%%';
    const sortDirection = (
      queryDto.sortDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'
    ) as 'ASC' | 'DESC';

    const publishedStatus = queryDto.publishedStatus;

    const queryBuilder = this.questionsRepository
      .createQueryBuilder('q')
      .where('q.body ILIKE :body ', { body: bodySearchTerm });
    if (publishedStatus === PublishedStatus.Published) {
      queryBuilder.andWhere('q.published = TRUE');
    } else if (publishedStatus === PublishedStatus.NotPublished) {
      queryBuilder.andWhere('q.published = FALSE');
    }
    const [items, count] = await queryBuilder
      .orderBy(`"${queryDto.sortBy}"`, sortDirection)
      .offset(offset)
      .limit(limit)
      .getManyAndCount();

    const res = items.map(this.questionOutputMapper);
    return paginationModelMapper(queryDto, count, res);
  }

  public async getById(id: string): Promise<QuestionViewModel | null> {
    const question = await this.questionsRepository.findOneBy({ id: id });
    if (!question) return null;
    return this.questionOutputMapper(question);
  }

  private questionOutputMapper = (question: Question): QuestionViewModel => {
    return {
      id: question.id,
      body: question.body,
      correctAnswers: [...question?.answers],
      published: question?.published,
      createdAt: question?.createdAt.toISOString(),
      // @ts-ignore
      updatedAt:
        question?.createdAt.toISOString() === question?.updatedAt.toISOString()
          ? null
          : question?.updatedAt.toISOString(),
    };
  };
}