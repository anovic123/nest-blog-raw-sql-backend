import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

import { SaQuizTypeormRepository } from "../../infra/sa-quiz-typeorm.repository";

import { CreateQuestionDto } from "../../api/models/dto/create-question.dto";

import { QuestionViewDto } from "../../api/models/output/question.view-dto";
import { QuizGameQuestion } from "../../domain/quiz-game-question.entity";

export class CreateQuestionCommand {
  constructor (
    public readonly body: CreateQuestionDto
  ) {}
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionUseCase implements ICommandHandler<CreateQuestionCommand> {
  constructor (
    private readonly saQuizTypeormRepository: SaQuizTypeormRepository
  ) {}

  async execute(command: CreateQuestionCommand): Promise<QuestionViewDto> {
      const newQuestion = QuizGameQuestion.createQuestion(command.body);

      const res = await this.saQuizTypeormRepository.createGameQuestion(newQuestion);

      return res;
  }
}