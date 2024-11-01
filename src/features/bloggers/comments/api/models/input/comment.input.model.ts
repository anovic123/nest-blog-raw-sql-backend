import { IsString, Length } from 'class-validator';
import { Trim } from 'src/core/decorators';

export class CommentInputModel {
  @IsString()
  @Trim()
  @Length(20, 300)
  content: string;
}