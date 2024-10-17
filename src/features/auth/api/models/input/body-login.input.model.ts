import { IsString } from 'class-validator';
import { Trim } from 'src/core/decorators';

export class BodyLoginModel {
  @IsString()
  @Trim()
  loginOrEmail: string;
  @IsString()
  @Trim()
  password: string;
}
