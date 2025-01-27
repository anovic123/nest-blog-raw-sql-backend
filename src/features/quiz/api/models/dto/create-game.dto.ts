import { ApiProperty } from '@nestjs/swagger';
import { GameStatus } from "src/features/quiz/domain/quiz-games.entity";

export class CreateGameDto {
  @ApiProperty({ description: 'The unique identifier of the game' })
  id: string;

  @ApiProperty({ description: 'The status of the game', enum: GameStatus })
  status: GameStatus;

  @ApiProperty({ description: 'The date when the pair was created' })
  pairCreatedData: Date;

  @ApiProperty({ description: 'The unique identifier of the first player' })
  firstPlayerId: string;
}