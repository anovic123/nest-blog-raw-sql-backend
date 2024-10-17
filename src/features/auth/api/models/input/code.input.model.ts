import { IsString } from 'class-validator';

export class CodeInputModel {
  @IsString()
  code: string;
}
