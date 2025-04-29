import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InterlayerNotice } from 'src/base/models/interlayer';

import { QuestionsRepository } from 'src/features/quiz/infra/questions.repository';

export class UpdatePublishQuestionCommand {
  constructor(
    public id: string,
    public published: boolean,
  ) {}
}

@CommandHandler(UpdatePublishQuestionCommand)
export class UpdatePublishQuestionUseCase
  implements ICommandHandler<UpdatePublishQuestionCommand>
{
  constructor(private questionsRepository: QuestionsRepository) {}

  async execute(command: UpdatePublishQuestionCommand) {
    const foundQuestion = await this.questionsRepository.findById(command.id);

    if (!foundQuestion) {
      const errorNotice = new InterlayerNotice(null);
      errorNotice.addError('Question does not exist', 'questionId', 404);
      return errorNotice;
    }
    if (command.published && foundQuestion.answers.length === 0) {
      const errorNotice = new InterlayerNotice(null);
      errorNotice.addError(
        'Property correctAnswers are not passed but property published is true',
        'published',
        400,
      );
      return errorNotice;
    }
    console.log('im here');
    await this.questionsRepository.updatePublishedQuestion({
      id: command.id,
      published: command.published,
    });
    return new InterlayerNotice(null);
  }
}