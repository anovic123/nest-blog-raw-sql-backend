import { User } from "src/features/users/domain/users.entity";
import { CommentInputModel } from "../../api/models/input/comment.input.model";
import { Comments } from "../../domain/comments.entity";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CommentsRepository } from "../../infra/comments.repository";
import { HttpException, HttpStatus, NotFoundException } from "@nestjs/common";


export class UpdateCommentCommand {
  constructor (
    public readonly commentId: Comments['id'],
    public readonly body: CommentInputModel,
    public readonly userId: User['id']
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase implements ICommandHandler<UpdateCommentCommand> {
  constructor (private readonly commentsRepository: CommentsRepository) {}

  async execute(command: UpdateCommentCommand) {
      const { commentId, body, userId } = command

      const isExisted = await this.commentsRepository.isCommentsExisted(commentId)

      if (!isExisted) {
        throw new NotFoundException()
      }

      const isOwn = await this.commentsRepository.isCommentsOwn(commentId, userId)

      if (!isOwn) {
        throw new HttpException('auth', HttpStatus.FORBIDDEN)
      }

      const res = await this.commentsRepository.updateComment(
        commentId,
        body.content
      )

      if (!res) {
        throw new HttpException('comments', HttpStatus.BAD_REQUEST)
      }
  }
}