import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InterlayerNotice } from 'src/base/models/interlayer';

import { QuestionsRepository } from 'src/features/quiz/infra/questions.repository';

export class UpdateQuestionCommand {
  constructor(
    public id: string,
    public body: string,
    public correctAnswers: string[],
  ) {}
}

@CommandHandler(UpdateQuestionCommand)
export class UpdateQuestionUseCase
  implements ICommandHandler<UpdateQuestionCommand>
{
  constructor(private questionsRepository: QuestionsRepository) {}

  async execute(command: UpdateQuestionCommand): Promise<InterlayerNotice> {
    const foundQuestion = await this.questionsRepository.findById(command.id);
    if (!foundQuestion) {
      const errorNotice = new InterlayerNotice(null);
      errorNotice.addError('Question does not exist', 'questionId', 404);
      return errorNotice;
    }
    if (foundQuestion.published && command.correctAnswers.length === 0) {
      const errorNotice = new InterlayerNotice(null);
      errorNotice.addError(
        'Property correctAnswers are not passed but property published is true',
        'published',
        400,
      );
      return errorNotice;
    }
    await this.questionsRepository.updateQuestion({
      id: command.id,
      body: command.body,
      correctAnswers: command.correctAnswers,
    });
    return new InterlayerNotice(null);
  }
}