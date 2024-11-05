import { Body, Controller, Get, HttpCode, HttpStatus, NotFoundException, Param, Post, Put, Query, Req, UseGuards } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";

import { POSTS_SORTING_PROPERTIES } from "../../blogs/api/blogs-admin.controller";

import { PostsQueryRepository } from "../infra/posts.query.repository";
import { CommentsQueryRepository } from "../../comments/infra/comments.query.repository";

import { RequestWithUser } from "src/base/types/request";

import { Pagination } from "src/base/models/pagination.base.model";

import { AuthGuard } from "src/core/guards/auth.guard";

import { CreatePostCommentCommand } from "../application/use-cases/create-post-comment";

import { CommentInputModel } from "../../comments/api/models/input/comment.input.model";

import { Public } from "src/core/decorators/public.decorator";
import { SortingPropertiesType } from "src/base/types/sorting-properties.type";
import { CommentViewModel } from "../../comments/api/models/output";
import { LikePostInputModel } from "./input/like-post.input.model";
import { LikePostCommand } from "../application/use-cases/like-post.use-case";

export const COMMENTS_SORTING_PROPERTIES: SortingPropertiesType<CommentViewModel> = ['id', 'content', 'createdAt']

@Controller('posts')
export class PostsController {
  constructor (
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly commandBus: CommandBus
  ) {}

  @UseGuards(AuthGuard)
  @Put('/:postId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async likePost(
    @Param('postId') postId: string,
    @Body() body: LikePostInputModel,
    @Req() request: RequestWithUser
  ) {
    const user = request['user']

    const post = await this.postsQueryRepository.getPostsById(postId, user?.userId)

    if (!post) {
      throw new NotFoundException()
    }

    return this.commandBus.execute(new LikePostCommand(postId, post?.extendedLikesInfo?.myStatus, body.likeStatus, user?.userId))
  }

  @Public()
  @UseGuards(AuthGuard)
  @Get()
  public async getPosts(
    @Query() query,
    @Req() request: RequestWithUser,
  ) {
    const user = request['user']
    const pagination = new Pagination(
      query,
      POSTS_SORTING_PROPERTIES
    )

    const blogsPostsResults = await this.postsQueryRepository.getBlogPosts(
      pagination,
      user?.userId
    )

    return blogsPostsResults;
  }

  @Public()
  @UseGuards(AuthGuard)
  @Get('/:id')
  public async getPostsById(
    @Param('id') postId: string,
    @Req() request: RequestWithUser,
  ) {
    const user = request['user']
    
    const blogsPostsResults = await this.postsQueryRepository.getPostsById(
      postId,
      user?.userId
    )

    if (!blogsPostsResults) {
      throw new NotFoundException(`Posts with id ${postId} not found`);
    }

    return blogsPostsResults;
  }

  @UseGuards(AuthGuard)
  @Post('/:postId/comments')
  @HttpCode(HttpStatus.CREATED)
  public async createPostComment(
    @Param('postId') postId: string,
    @Body() body: CommentInputModel,
    @Req() request: RequestWithUser
  ) {
    if (!postId) {
      throw new NotFoundException('post id is required')
    }

    const user = request['user']

    return this.commandBus.execute(new CreatePostCommentCommand(
      postId,
      body,
      user?.userId
    ))
  }

  @Public()
  @UseGuards(AuthGuard)
  @Get('/:postId/comments')
  public async getPostsComments(
    @Param('postId') postId: string,
    @Query() query,
    @Req() request: RequestWithUser
  ) {
    
    if (!postId) {
      throw new NotFoundException('post id is required')
    }
    
    const user = request['user']
    
    const pagination = new Pagination(
      query,
      COMMENTS_SORTING_PROPERTIES
    )

    const result = await this.commentsQueryRepository.getPostsComments(
      postId,
      pagination,
      user?.userId
    )

    if (!result || result.items.length === 0) {
      throw new NotFoundException(`Posts with id ${postId} not found`);
    }

    return result;
  }
}
