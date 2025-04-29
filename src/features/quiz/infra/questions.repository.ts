import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Question } from '../domain/question.entity';

@Injectable()
export class QuestionsRepository {
  constructor(
    @InjectRepository(Question)
    private readonly questionsRepository: Repository<Question>,
  ) {}

  public async createQuestion(question: Question): Promise<Question> {
    return this.questionsRepository.save(question);
  }

  public async findById(id: string): Promise<Question> {
    // @ts-ignore
    return this.questionsRepository.findOneBy({ id: id });
  }

  public async updateQuestion(param: {
    id: string;
    body: string;
    correctAnswers: string[];
  }) {
    await this.questionsRepository.update(
      { id: param.id },
      { body: param.body, answers: param.correctAnswers },
    );
  }

  public async updatePublishedQuestion(param: { id: string; published: boolean }) {
    await this.questionsRepository.update(
      { id: param.id },
      { published: param.published },
    );
  }

  public async deleteQuestion(param: { id: string }) {
    await this.questionsRepository.delete({ id: param.id });
  }

  public async getFiveRandomPublishQuestions(): Promise<Question[]> {
    return this.questionsRepository
      .createQueryBuilder()
      .orderBy('RANDOM()')
      .where('published = TRUE')
      .limit(5)
      .getMany();
  }
}