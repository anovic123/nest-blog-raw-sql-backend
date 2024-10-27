import { IsEnum, IsNotEmpty } from 'class-validator';

import { Trim } from 'src/core/decorators';

import { LikeCommentStatus } from '../output';

export class LikeStatusInputModel {
  @IsNotEmpty()
  @Trim()
  @IsEnum(LikeCommentStatus)
  likeStatus = LikeCommentStatus.NONE;
}
