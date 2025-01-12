import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { NotFoundException } from "@nestjs/common";

import { QuizGameQuestion } from "../../domain/quiz-game-question.entity";

import { SaQuizTypeormRepository } from "../../infra/sa-quiz-typeorm.repository";

export class DeleteQuestionCommand {
  constructor(
    public readonly id: QuizGameQuestion['id']
  ) {}
}

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionUseCase implements ICommandHandler<DeleteQuestionCommand> {
  constructor(
    private readonly saQuizTypeormRepository: SaQuizTypeormRepository
  ) {}

  async execute(command: DeleteQuestionCommand): Promise<void> {
    const { id } = command;

    const res = await this.saQuizTypeormRepository.deleteQuestion(id)

    if (!res) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }
  }
}