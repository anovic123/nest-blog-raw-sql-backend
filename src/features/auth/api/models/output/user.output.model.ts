import { ApiProperty } from "@nestjs/swagger";

export class UserOutputModel {
  @ApiProperty({ example: "31e93ff2-51c1-455d-ac56-a84b7689a134", description: "id" })
  id: string;
  @ApiProperty({ example: "3606lg", description: "login" })
  login: string;
  @ApiProperty({ example: "3606user@em.com", description: "email" })
  email: string;
  @ApiProperty({ example: "2024-11-04 19:13:36.957+00", description: "createdAt" })
  createdAt: Date;
}