import { ApiProperty } from "@nestjs/swagger";

export class AccessToken {
  @ApiProperty({
    description: 'Access token',
    example: '',
    type: String
  })
  accessToken: string;
}