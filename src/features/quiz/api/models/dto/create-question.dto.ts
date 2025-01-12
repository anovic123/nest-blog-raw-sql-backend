import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsString, Length } from "class-validator";

import { Trim } from "@core/decorators";

export class CreateQuestionDto {
  @ApiProperty({
    description: "body",
    example: "Text of questions, for example: How many continents are there?"
  })
  @IsString()
  @Trim()
  @Length(10, 500)
  body: string;

  @ApiProperty({
    description: "correct answers",
    example: '["6", "5", "3"]'
  })
  @IsArray()
  @IsString({ each: true })
  correctAnswers: string[]
}