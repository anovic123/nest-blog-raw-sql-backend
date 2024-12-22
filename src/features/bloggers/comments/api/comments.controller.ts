import { Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Put, Req, UseGuards } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";

import { AuthGuard } from "src/core/guards/auth.guard";

import { CommentInputModel } from "./models/input/comment.input.model";
import { LikeStatusInputModel } from "./models/input/likes.input.model";

import { CommentsQueryRepository } from "../infra/comments.query.repository";

import { DeleteCommentCommand } from "../application/use-cases/delete-comment.use-case";
import { UpdateCommentCommand } from "../application/use-cases/update-comment.use-case";
import { LikeCommentCommand } from "../application/use-cases/like-comment.use-case";

import { RequestWithUser } from "src/base/types/request";

import { Public } from "src/core/decorators/public.decorator";
import { CommentViewModel } from "./models/output";

@Controller('comments')
export class CommentsController {
  constructor (
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly commandBus: CommandBus
  ) {}

  @UseGuards(AuthGuard)
  @Put('/:commentId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Make like/unlike/dislike/undislike opearation',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'No Content'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "If the inputModel has incorrect values"
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Unauthorized"
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "If comment with specified id doesn\'t exists"
  })
  public async likeComment(
    @Param('commentId') commentId: string,
    @Body() body: LikeStatusInputModel,
    @Req() request: RequestWithUser
  ) {
    const user = request['user']

    const comment = await this.commentsQueryRepository.getPostsCommentsById(commentId, user?.userId, true)

    if (!comment || !comment.postId) {
      throw new NotFoundException()
    }

    return this.commandBus.execute(new LikeCommentCommand(commentId, comment?.likesInfo?.myStatus, body.likeStatus, user?.userId, comment?.postId))
  }

  @Public()
  @UseGuards(AuthGuard)
  @Get(
    '/:id'
  )
  @ApiOperation({
    summary: "Return comment by id"
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Success",
    type: CommentViewModel
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Not Found"
  })
  public async getPostCommentsById(
    @Param('id') id: string,
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
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Delete comment specified by id"
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: "No Content"
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Unauthorized"
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "If try delete the comment that is not your own"
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Not Found"
  })
  public async deleteCommentById(
    @Param('commentId') commentId: string,
    @Req() request: RequestWithUser
  ) {
    const user = request['user']

    return this.commandBus.execute(new DeleteCommentCommand(commentId, user?.userId))
  }

  @UseGuards(AuthGuard)
  @Put('/:commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Update existing comment by id with InputModel"
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'No Content'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "If the inputModel has incorrect values"
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Unauthorized"
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "If try edit the comment that is not your own"
  })
  public async updateCommentById(
    @Param('commentId') commentId: string,
    @Body() body: CommentInputModel,
    @Req() request: Request
  ) {
    const user = request['user']

    return this.commandBus.execute(new UpdateCommentCommand(commentId, body, user?.userId))
  }
}