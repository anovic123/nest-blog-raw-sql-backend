import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { NotFoundException } from "@nestjs/common";
import { Logger } from "@nestjs/common";

import { QuizGameQuestion } from "../../domain/quiz-game-question.entity";
import { SaQuizTypeormRepository } from "../../infra/sa-quiz-typeorm.repository";

export class DeleteQuestionCommand {
  constructor(
    public readonly id: QuizGameQuestion['id']
  ) {}
}

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionUseCase implements ICommandHandler<DeleteQuestionCommand> {
  private readonly logger = new Logger(DeleteQuestionUseCase.name);

  constructor(
    private readonly saQuizTypeormRepository: SaQuizTypeormRepository
  ) {}

  async execute(command: DeleteQuestionCommand): Promise<void> {
    const { id } = command;

    const question = await this.saQuizTypeormRepository.questionIsExist(id);

    if (!question) {
      throw new NotFoundException(`Question with id ${id} not found`);
    }

    this.logger.log(`Deleting question with id ${id}`);

    const deleteResult = await this.saQuizTypeormRepository.deleteQuestion(id);

    if (!deleteResult) {
      throw new NotFoundException(`Question with id ${id} not deleted`);
    }

    this.logger.log(`Question with id ${id} successfully deleted`);
  }
}
