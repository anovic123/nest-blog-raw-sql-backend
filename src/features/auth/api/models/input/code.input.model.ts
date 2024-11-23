import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CodeInputModel {
  @ApiProperty({
    description: 'Code from email',
    required: true,
    type: String,
    example: '123qwe'
  })
  @IsString()
  code: string;
}
