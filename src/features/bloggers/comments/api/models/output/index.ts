import { ApiProperty } from '@nestjs/swagger';

export enum LikeCommentStatus {
  NONE = 'None',
  LIKE = 'Like',
  DISLIKE = 'Dislike',
}

export class CommentOutputCommentatorInfoModel {
  @ApiProperty({ description: 'Unique identifier of the user' })
  userId: string;

  @ApiProperty({ description: 'Login of the user' })
  userLogin: string;
}

export class CommentLikesViewModel {
  @ApiProperty({ description: 'Number of likes' })
  likesCount: number;

  @ApiProperty({ description: 'Number of dislikes' })
  dislikesCount: number;

  @ApiProperty({ description: 'Current like/dislike status', enum: LikeCommentStatus })
  myStatus: LikeCommentStatus;
}

export class CommentViewModel {
  @ApiProperty({ description: 'Unique identifier of the comment' })
  id: string;

  @ApiProperty({ description: 'Content of the comment' })
  content: string;

  @ApiProperty({ description: 'Information about the commentator' })
  commentatorInfo: CommentOutputCommentatorInfoModel;

  @ApiProperty({ description: 'Date the comment was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Information about likes and dislikes' })
  likesInfo: CommentLikesViewModel;

  @ApiProperty({ description: 'Optional identifier of the related post', required: false })
  postId?: string;
}
