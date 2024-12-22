import { IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Trim } from 'src/core/decorators';
import { LikePostStatus } from '../output';

export class LikePostInputModel {
  @ApiProperty({
    description: 'The status of the like (e.g., LIKE, DISLIKE, or NONE)',
    enum: LikePostStatus,
  })
  @IsString()
  @Trim()
  @IsEnum(LikePostStatus)
  likeStatus: LikePostStatus;
}
