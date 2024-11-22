import { IsEmail, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import {
  EmailIsExist,
  LoginIsExist,
  Trim,
} from '../../../../../core/decorators';

export class UserCreateModel {
  @ApiProperty({
    example: "3606lg",
    description: "login"
  })
  @IsString()
  @Trim()
  @Length(3, 10)
  @LoginIsExist()
  login: string;

  @ApiProperty({
    example: "1232112313eqwqwe",
    description: "password"
  })
  @IsString()
  @Trim()
  @Length(6, 20)
  password: string;

  @ApiProperty({
    example: "3606user@em.com",
    description: "email"
  })
  @IsString()
  @Trim()
  @IsEmail()
  @EmailIsExist()
  email: string;
}