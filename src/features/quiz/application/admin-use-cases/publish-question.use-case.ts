import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

import { SaQuizTypeormRepository } from "../../infra/sa-quiz-typeorm.repository";

import { QuizGameQuestion } from "../../domain/quiz-game-question.entity";

import { PublishQuestionDto } from "../../api/models/input/publish-question.input-dto";
import { NotFoundException } from "@nestjs/common";

export class PublishQuestionCommand {
  constructor (
    public readonly id: QuizGameQuestion['id'],
    public readonly body: PublishQuestionDto
  ) {}
}

@CommandHandler(PublishQuestionCommand)
export class PublishQuestionUseCase implements ICommandHandler<PublishQuestionCommand> {
  constructor(
    private readonly saQuizTypeormRepository: SaQuizTypeormRepository
  ) {}

  async execute(command: PublishQuestionCommand): Promise<void> {
    const { id, body } = command;

    const question = await this.saQuizTypeormRepository.questionIsExist(id);

    if (!question) {
      throw new NotFoundException(`Question with id ${id} not found`);
    }

    await this.saQuizTypeormRepository.publishQuestion(id, body);
  }
}