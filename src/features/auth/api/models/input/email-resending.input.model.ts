import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';
import { Trim } from 'src/core/decorators';

export class EmailResendingModel {
  @ApiProperty({
    required: true,
    type: String,
    description: 'email',
    example: 'mail123@gmail.com'
  })
  @IsString()
  @Trim()
  @IsEmail()
  email: string;
}
