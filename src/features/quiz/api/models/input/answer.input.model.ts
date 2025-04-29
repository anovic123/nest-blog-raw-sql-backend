import { ApiProperty } from '@nestjs/swagger';

export class AnswerInputModel {
  @ApiProperty({ description: 'The answer provided by the user' })
  answer: string;
}
