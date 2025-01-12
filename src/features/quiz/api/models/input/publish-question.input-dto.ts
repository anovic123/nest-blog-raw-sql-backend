import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export class PublishQuestionDto {
  @ApiProperty({
    description: "published",
    example: "True if question is completed and can be used in the Quiz game"
  })
  @IsBoolean()
  published: boolean;
}