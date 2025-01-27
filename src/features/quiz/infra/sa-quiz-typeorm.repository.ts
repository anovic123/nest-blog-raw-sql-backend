import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { QuizGameQuestion } from "../domain/quiz-game-question.entity";

import { QuestionViewDto } from "../api/models/output/question.view-dto";
import { UpdateQuestionDto } from "../api/models/input/update-question.input-dto";
import { PublishQuestionDto } from "../api/models/input/publish-question.input-dto";

@Injectable()
export class SaQuizTypeormRepository {
  constructor(
    @InjectRepository(QuizGameQuestion)
    private readonly saQuizGameQuestionRepository: Repository<QuizGameQuestion>
  ) {}

  public async createGameQuestion(question: QuizGameQuestion): Promise<QuestionViewDto> {
    const res = await this.saQuizGameQuestionRepository.save(question);

    return QuestionViewDto.mapToView(question);
  }

  public async deleteQuestion(id: QuizGameQuestion['id']): Promise<boolean> {
    const res = await this.saQuizGameQuestionRepository.softDelete(id);

    return res.affected !== undefined && res.affected !== null && res.affected > 0;
  }

  public async findQuestion(id: QuizGameQuestion['id']): Promise<QuizGameQuestion | null> {
    const res = await this.saQuizGameQuestionRepository.createQueryBuilder('s')
    .select(['s.*'])
    .where("s.id = :id", { id })
    .getOne()

    return res || null;
  }

  public async questionIsExist(id: QuizGameQuestion['id']): Promise<boolean> {
    const count = await this.saQuizGameQuestionRepository.count({
      where: { id }
    })
    
    return count > 0
  }

  public async updateQuestion(id: QuizGameQuestion['id'], body: UpdateQuestionDto): Promise<boolean> {
    const res = await this.saQuizGameQuestionRepository.update(
      {
        id
      },
      {
        ...body
      }
    )

    return res?.affected !== undefined && res.affected !== null && res.affected > 0;
  }

  public async publishQuestion(id: QuizGameQuestion['id'], body: PublishQuestionDto): Promise<boolean> {
    const res = await this.saQuizGameQuestionRepository.update({
      id
    },
    {
      published: body.published
    })

    return res?.affected !== undefined && res.affected !== null && res.affected > 0;
  }
}