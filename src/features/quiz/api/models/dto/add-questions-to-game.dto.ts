import { ApiProperty } from "@nestjs/swagger";

export class AddQuestionsToGameDto {
  @ApiProperty({ description: 'The unique identifier of the game' })
  gameId: string;

  @ApiProperty({ description: 'The unique identifier of the question' })
  questionsId: string[];
}