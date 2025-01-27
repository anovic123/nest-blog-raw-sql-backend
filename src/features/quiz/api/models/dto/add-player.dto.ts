import { ApiProperty } from '@nestjs/swagger';

export class AddPlayerDto {
  @ApiProperty({
    description: 'ID of the player',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'ID of the second player',
    example: '123e4567-e89b-12d3-a456-426614174001'
  })
  secondPlayerId: string;
}