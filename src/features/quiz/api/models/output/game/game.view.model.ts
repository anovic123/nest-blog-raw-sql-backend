import { AnswerStatus } from '../../enums/answer-status';
import { GameStatus } from '../../enums/game-status';

export class PlayerViewModel {
  id: string;
  login: string;
}
export class QuestionViewModel {
  id: string;
  body: string;
}
export class AnswersViewModel {
  questionId: string;
  answerStatus: AnswerStatus;
  addedAt: string;
}
export class GamePlayerProgressViewModel {
  answers: AnswersViewModel[];
  player: PlayerViewModel;
  score: number;
}
export class GamePairViewModel {
  id: string;
  firstPlayerProgress: GamePlayerProgressViewModel;
  secondPlayerProgress: GamePlayerProgressViewModel;
  questions: QuestionViewModel[];
  status: GameStatus;
  pairCreatedDate: string;
  startGameDate: string;
  finishGameDate: string;
}
