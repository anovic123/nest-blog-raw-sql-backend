import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export class PublishQuestionDto {
  @ApiProperty({
    description: "published",
    example: true
  })
  @IsBoolean()
  published: boolean;
}