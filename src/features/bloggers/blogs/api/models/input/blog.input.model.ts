import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl, Length } from 'class-validator';
import { Trim } from 'src/core/decorators';

export class BlogInputModel {
  @ApiProperty({
    description: "name",
    example: "blog",
    required: true,
    type: String
  })
  @IsString()
  @Trim()
  @Length(1, 15)
  name: string;
  @ApiProperty({
    description: "description",
    example: "blog description",
    required: true,
    type: String
  })
  @IsString()
  @Trim()
  @Length(1, 500)
  description: string;
  @ApiProperty({
    description: "websiteUrl",
    example: "websiteUrl",
    required: true,
    type: String
  })
  @IsString()
  @Trim()
  @IsUrl()
  @Length(1, 100)
  websiteUrl: string;
}