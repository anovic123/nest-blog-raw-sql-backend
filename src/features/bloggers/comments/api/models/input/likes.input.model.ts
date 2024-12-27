import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { Trim } from 'src/core/decorators';

import { LikeCommentStatus } from '../output';

export class LikeStatusInputModel {
  @ApiProperty({
    description: 'Status of the like/dislike action',
    example: LikeCommentStatus.LIKE,
    required: true,
    enum: LikeCommentStatus,
  })
  @IsNotEmpty({ message: 'Like status must not be empty' })
  @Trim()
  @IsEnum(LikeCommentStatus, { message: 'Invalid status value' })
  likeStatus: LikeCommentStatus = LikeCommentStatus.NONE;
}
