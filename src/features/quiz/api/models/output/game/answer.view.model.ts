import { AnswerStatus } from '../../enums/answer-status';

export class AnswerViewModel {
  questionId: string;
  answerStatus: AnswerStatus;
  addedAt: string;
}
