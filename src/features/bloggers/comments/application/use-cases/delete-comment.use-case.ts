import { HttpException, HttpStatus, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

import { User } from "src/features/users/domain/users.entity";
import { Comments } from "../../domain/comments.entity";

import { CommentsTypeormRepository } from "../../infra/comments-typeorm.repository";

export class DeleteCommentCommand {
  constructor(
    public readonly commentId: Comments['id'],
    public readonly userId: User['id']
  ) {} 
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase implements ICommandHandler<DeleteCommentCommand> {
  constructor (
    private readonly commentsRepository: CommentsTypeormRepository
  ) {}

  async execute(command: DeleteCommentCommand){
      const { commentId, userId } = command

      const isExisted = await this.commentsRepository.isCommentsExisted(commentId)

      if (!isExisted) {
        throw new NotFoundException()
      }

      const isOwn = await this.commentsRepository.isCommentsOwn(commentId, userId)

      if (!isOwn) {
        throw new HttpException('auth', HttpStatus.FORBIDDEN)
      }

      return await this.commentsRepository.deleteComment(commentId);
  }
}