import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { Trim } from 'src/core/decorators';

export class BodyLoginModel {
  @ApiProperty({
    description: 'loginOrEmail',
    example: '3606lg',
    required: true,
    type: String,
  })
  @IsString()
  @Trim()
  loginOrEmail: string;
  @ApiProperty({
    description: 'password',
    example: 'asdasasd1223',
    required: true,
    type: String,
  })
  @IsString()
  @Trim()
  password: string;
}
