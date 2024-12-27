import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { HttpException, HttpStatus } from "@nestjs/common";

import { User } from "src/features/users/domain/users.entity";
import { Comments } from "../../domain/comments.entity";
import { Posts } from "src/features/bloggers/posts/domain/posts.entity";

import { CommentsRepository } from "../../infra/comments.repository";

import { LikeCommentStatus } from "../../api/models/output";
import { UsersTypeormRepository } from "src/features/users/infra/users-typeorm.repository";

export class LikeCommentCommand {
  constructor (
    public readonly commentId: Comments['id'],
    public readonly userLikesStatus: LikeCommentStatus | undefined,
    public readonly bodyLikesStatus: LikeCommentStatus,
    public readonly userId: User['id'],
    public readonly postId: Posts['id']
  ) {}
}

@CommandHandler(LikeCommentCommand)
export class LikeCommentUseCase implements ICommandHandler<LikeCommentCommand> {
  constructor(
    private readonly usersRepository: UsersTypeormRepository,
    private readonly commentsRepository: CommentsRepository
  ) {}

  async execute(command: LikeCommentCommand) {
      const { commentId, userLikesStatus, bodyLikesStatus, userId, postId } = command

      if (!userId) return

      const user = await this.usersRepository.findUserById(userId)

      if (!user) {
        throw new HttpException('user', HttpStatus.NOT_FOUND)
      }

      if (userLikesStatus === bodyLikesStatus) {
        return
      }

      switch (bodyLikesStatus) {
        case LikeCommentStatus.NONE:
          await this.commentsRepository.noneStatusComments(userId,postId, commentId)
          break;
        case LikeCommentStatus.LIKE:
          await this.commentsRepository.likeComments(userId, postId, commentId)
          break;
        case LikeCommentStatus.DISLIKE:
          await this.commentsRepository.dislikeComments(userId, postId, commentId)
          break
        default:
          return;
      }
  }
}
