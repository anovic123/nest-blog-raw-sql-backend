import { IsEnum, IsString } from 'class-validator';
import { Trim } from 'src/core/decorators';
import { LikePostStatus } from '../output';

export class LikePostInputModel {
  @IsString()
  @Trim()
  @IsEnum(LikePostStatus)
  likeStatus: LikePostStatus;
}