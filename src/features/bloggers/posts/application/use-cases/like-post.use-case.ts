import { HttpException, HttpStatus } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

import { User } from "src/features/users/domain/users.entity";

import { UsersTypeormRepository } from "src/features/users/infra/users-typeorm.repository";
import { PostsTypeormRepository } from "../../infra/posts-typeorm.repository";

import { Posts } from "../../domain/posts.entity";

import { LikePostStatus } from "../../api/output";

export class LikePostCommand {
  constructor(
    public readonly postId: Posts['id'],
    public readonly userLikesStatus: LikePostStatus | undefined,
    public readonly bodyLikesStatus: LikePostStatus,
    public readonly userId: User['id']
  ) {}
}

@CommandHandler(LikePostCommand)
export class LikePostUseCase implements ICommandHandler<LikePostCommand> {
  constructor(
    private readonly usersRepository: UsersTypeormRepository,
    private readonly postsRepository: PostsTypeormRepository
  ) {} 
  
  async execute(command: LikePostCommand) {
      const { postId, userLikesStatus, bodyLikesStatus, userId } = command

      if (!userId) return;

      const user = await this.usersRepository.findUserById(userId)

      if (!user) {
        throw new HttpException('user', HttpStatus.NOT_FOUND)
      }

      if (userLikesStatus === bodyLikesStatus) {
        return
      }

      switch (bodyLikesStatus) {
        case LikePostStatus.NONE:
          await this.postsRepository.noneStatusPost(userId, postId)
          break;
        case LikePostStatus.LIKE:
          await this.postsRepository.likePost(userId, postId)
          break;
        case LikePostStatus.DISLIKE:
          await this.postsRepository.dislikePost(userId, postId)
          break
        default:
          return;
      }
  }
}