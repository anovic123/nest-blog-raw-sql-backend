import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
import { Trim } from 'src/core/decorators';

export class CommentInputModel {
  @ApiProperty({
    description: "blogId",
    example: "blog blogId",
    required: true,
    type: String
  })
  @IsString()
  @Trim()
  @Length(20, 300)
  content: string;
}