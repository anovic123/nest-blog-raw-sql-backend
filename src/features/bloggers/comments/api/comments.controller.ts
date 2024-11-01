import { Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Put, Req, UseGuards } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";

import { CommentsQueryRepository } from "../infra/comments.query.repository";
import { AuthGuard } from "src/core/guards/auth.guard";
import { Public } from "src/core/decorators/public.decorator";
import { RequestWithUser } from "src/base/types/request";
import { Comments } from "../domain/comments.entity";
import { CommentInputModel } from "./models/input/comment.input.model";
import { DeleteCommentCommand } from "../application/use-cases/delete-comment.use-case";
import { UpdateCommentCommand } from "../application/use-cases/update-comment.use-case";
import { LikeCommentStatus } from "./models/output";
import { LikeCommentCommand } from "../application/use-cases/like-comment.use-case";
import { LikeStatusInputModel } from "./models/input/likes.input.model";

@Controller('comments')
export class CommentsController {
  constructor (
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly commandBus: CommandBus
  ) {}

  @UseGuards(AuthGuard)
  @Put('/:commentId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async likeComment(
    @Param('commentId') commentId: string,
    @Body() body: LikeStatusInputModel,
    @Req() request: RequestWithUser
  ) {
    const user = request['user']

    const comment = await this.commentsQueryRepository.getPostsCommentsById(commentId, user?.userId, true)

    if (!comment) {
      throw new NotFoundException()
    }

    return this.commandBus.execute(new LikeCommentCommand(commentId, comment?.likesInfo?.myStatus, body.likeStatus, user?.userId, comment?.postId!))
  }

  @Public()
  @UseGuards(AuthGuard)
  @Get(
    '/:id'
  )
  public async getPostCommentsById(
    @Param('id') id: Comments['id'],
    @Req() request: RequestWithUser
  ) {
    const user = request['user']

    const result = await this.commentsQueryRepository.getPostsCommentsById(id, user?.userId, false)

    if (!result) {
      throw new NotFoundException('posts comments not found');
    }

    return result;
  }

  @UseGuards(AuthGuard)
  @Delete('/:commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteCommentById(
    @Param('commentId') commentId: Comments['id'],
    @Req() request: RequestWithUser
  ) {
    const user = request['user']

    return this.commandBus.execute(new DeleteCommentCommand(commentId, user?.userId))
  }

  @UseGuards(AuthGuard)
  @Put('/:commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async updateCommentById(
    @Param('commentId') commentId: Comments['id'],
    @Body() body: CommentInputModel,
    @Req() request: Request
  ) {
    const user = request['user']

    return this.commandBus.execute(new UpdateCommentCommand(commentId, body, user?.userId))
  }
}