import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length } from "class-validator";
import { Trim } from "src/core/decorators";

export class UpdatePostInputModel {
  @ApiProperty({
    description: 'title',
    example: 'post title',
    required: true,
    type: String,
  })
  @IsString()
  @Trim()
  @Length(1, 30)
  title: string;
  @ApiProperty({
    description: 'shortDescription',
    example: 'post shortDescription',
    required: true,
    type: String,
  })
  @IsString()
  @Trim()
  @Length(1, 100)
  shortDescription: string
  @ApiProperty({
    description: 'content',
    example: 'post content',
    required: true,
    type: String,
  })
  @IsString()
  @Trim()
  @Length(1, 1000)
  content: string;
}