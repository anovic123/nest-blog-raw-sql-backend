import { ApiProperty } from '@nestjs/swagger';
import { GameStatus } from "src/features/quiz/domain/quiz-games.entity";

export class GameQuestionViewDto {
  @ApiProperty({ example: '1' })
  id: string;

  @ApiProperty({ example: 'What is the capital of France?' })
  body: string;
}

export enum AnswerStatus {
  Correct = 'Correct',
  Incorrect = 'Incorrect'
}

export class PlayerDto {
  @ApiProperty({ example: '1' })
  id: string;

  @ApiProperty({ example: 'player1' })
  login: string;
}

export class AnswerDto {
  @ApiProperty({ example: '1' })
  questionId: string;

  @ApiProperty({ enum: AnswerStatus })
  answerStatus: AnswerStatus;

  @ApiProperty({ type: Date })
  addedAt: Date | string;
}

export class PlayerProgressDto {
  @ApiProperty({ type: [AnswerDto] })
  answers: AnswerDto[];

  @ApiProperty({ type: PlayerDto })
  player: PlayerDto;

  @ApiProperty({ example: 10 })
  score: number;
}

export class GameViewDto {
  @ApiProperty({ example: '1' })
  id: string;

  @ApiProperty({ type: () => PlayerProgressDto })
  firstPlayerProgress: PlayerProgressDto;

  @ApiProperty({ type: () => PlayerProgressDto })
  secondPlayerProgress: PlayerProgressDto | null;

  @ApiProperty({ type: [GameQuestionViewDto], nullable: true })
  questions: GameQuestionViewDto[] | null;

  @ApiProperty({ enum: GameStatus })
  status: GameStatus;

  @ApiProperty({ type: Date })
  pairCreatedDate: Date;

  @ApiProperty({ type: Date })
  startGameDate: Date;

  @ApiProperty({ type: Date })
  finishGameDate: Date;
}