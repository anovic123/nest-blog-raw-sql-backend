import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
import { Trim } from 'src/core/decorators';

import { BlogIsExist } from 'src/core/decorators/validate/is-post-exist.decorator';

export class PostInputModel {
  @ApiProperty({
    description: "title",
    example: "blog title",
    required: true,
    type: String
  })
  @IsString()
  @Trim()
  @Length(1, 30)
  title: string;
  @ApiProperty({
    description: "shortDescription",
    example: "blog shortDescription",
    required: true,
    type: String
  })
  @IsString()
  @Trim()
  @Length(1, 100)
  shortDescription: string;
  @ApiProperty({
    description: "content",
    example: "blog content",
    required: true,
    type: String
  })
  @IsString()
  @Trim()
  @Length(1, 1000)
  content: string;
  @ApiProperty({
    description: "blogId",
    example: "blog blogId",
    required: true,
    type: String
  })
  @IsString()
  @Trim()
  @BlogIsExist()
  blogId: string;
}