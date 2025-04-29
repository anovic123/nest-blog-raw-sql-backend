import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { QuestionsRepository } from 'src/features/quiz/infra/questions.repository';

import { Question } from 'src/features/quiz/domain/question.entity';

export class CreateQuestionCommand {
  constructor(
    public body: string,
    public correctAnswers: string[],
  ) {}
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionUseCase
  implements ICommandHandler<CreateQuestionCommand>
{
  constructor(private questionsRepository: QuestionsRepository) {}

  async execute(command: CreateQuestionCommand) {
    const newQuestion = Question.create(command.body, command.correctAnswers);
    const createdQuestion =
      await this.questionsRepository.createQuestion(newQuestion);
    return { questionId: createdQuestion.id };
  }
}