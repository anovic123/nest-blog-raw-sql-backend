import { IsEmail, IsString, Length } from 'class-validator';
import { EmailIsExist, LoginIsExist, Trim } from 'src/core/decorators';

export class UserCreateModel {
  @IsString()
  @Trim()
  @Length(3, 10)
  @LoginIsExist()
  login: string;

  @IsString()
  @Trim()
  @Length(6, 20)
  password: string;

  @IsString()
  @Trim()
  @IsEmail()
  @EmailIsExist()
  email: string;
}
