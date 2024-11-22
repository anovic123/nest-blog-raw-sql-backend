import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
import { Trim } from 'src/core/decorators';

export class NewPasswordInputModel {
  @ApiProperty({ example: "qweqw123" })
  @IsString()
  @Trim()
  @Length(6, 20)
  newPassword: string;
  @ApiProperty({ example: "123qw1" })
  @IsString()
  @Trim()
  recoveryCode: string;
}
