import { CommentsRepository } from "./../../../comments/infra/comments.repository";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { HttpException, HttpStatus, UnauthorizedException } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";

import { UsersTypeormRepository } from "src/features/users/infra/users-typeorm.repository";
import { PostsTypeormRepository } from "../../infra/posts-typeorm.repository";

import { CommentInputModel } from "src/features/bloggers/comments/api/models/input/comment.input.model";
import { Comments } from "src/features/bloggers/comments/domain/comments.entity";

export class CreatePostCommentCommand {
  constructor (
    public readonly postId: string,
    public readonly content: CommentInputModel,
    public readonly userId: string
  ) {}
}

@CommandHandler(CreatePostCommentCommand)
export class CreatePostCommentUseCase implements ICommandHandler<CreatePostCommentCommand> {
  constructor (
    private readonly postsRepository: PostsTypeormRepository,
    private readonly commentsRepository: CommentsRepository,
    private readonly usersRepository: UsersTypeormRepository
  ) {}

  async execute(command: CreatePostCommentCommand) {
      const { content, postId, userId } = command

      const existedPost = await this.postsRepository.isPostExisted(postId)

      if (!existedPost) {
        throw new HttpException('post', HttpStatus.NOT_FOUND)
      }

      const user = await this.usersRepository.findUserById(userId)

      if (!user) {
        return new UnauthorizedException()
      }

      const newComment: Comments = {
        id: uuidv4(),
        content: content.content,
        createdAt: new Date,
        postId,
        userId,
        userLogin: user.login
      }

      const res = await this.commentsRepository.createPostComment(newComment)

      return res
  }
}