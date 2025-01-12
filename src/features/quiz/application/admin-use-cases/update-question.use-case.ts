import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

import { SaQuizTypeormRepository } from "../../infra/sa-quiz-typeorm.repository";

import { QuizGameQuestion } from "../../domain/quiz-game-question.entity";

import { UpdateQuestionDto } from "../../api/models/input/update-question.input-dto";
import { NotFoundException } from "@nestjs/common";

export class UpdateQuestionCommand {
  constructor(
    public id: QuizGameQuestion['id'],
    public body: UpdateQuestionDto
  ) {}
}

@CommandHandler(UpdateQuestionCommand)
export class UpdateQuestionUseCase implements ICommandHandler<UpdateQuestionCommand> {
  constructor(
    private readonly saQuizTypeormRepository: SaQuizTypeormRepository
  ) {}

  async execute(command: UpdateQuestionCommand): Promise<void> {
    const { id, body } = command;

    const question = await this.saQuizTypeormRepository.findQuestion(id);

    if (!question) {
      throw new NotFoundException(`Question with id ${id} not found`);
    }

    await this.saQuizTypeormRepository.updateQuestion(id, body);
  }
}