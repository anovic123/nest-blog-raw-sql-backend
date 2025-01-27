import { ApiProperty } from '@nestjs/swagger';

export class CreatePlayerDto {
  @ApiProperty({ description: 'The unique identifier of the player' })
  id: string;

  @ApiProperty({ description: 'The unique identifier of the user' })
  userId: string;

  @ApiProperty({ description: 'The login name of the player' })
  login: string;

  @ApiProperty({ description: 'The unique identifier of the game' })
  gameId: string;
}