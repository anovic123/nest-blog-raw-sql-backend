import { IsString, Length } from 'class-validator';

import { Trim } from 'src/core/decorators';

export class BlogPostInputModel {
  @IsString()
  @Trim()
  @Length(1, 30)
  title: string;
  @IsString()
  @Trim()
  @Length(1, 100)
  shortDescription: string;
  @IsString()
  @Trim()
  @Length(1, 1000)
  content: string;
}
