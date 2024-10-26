import { Controller, Get, NotFoundException, Param, Query, Req } from "@nestjs/common";

import { PostsQueryRepository } from "../infra/posts.query.repository";

import { RequestWithUser } from "src/base/types/request";
import { Pagination } from "src/base/models/pagination.base.model";
import { POSTS_SORTING_PROPERTIES } from "../../blogs/api/blogs-admin.controller";

@Controller('posts')
export class PostsController {
  constructor (
    private readonly postsQueryRepository: PostsQueryRepository
  ) {}

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
      // user?.userId
    )

    return blogsPostsResults;
  }

  @Get('/:id')
  public async getPostsById(
    @Param('id') postId: string,
    @Req() request: RequestWithUser,
  ) {
    const user = request['user']
    
    const blogsPostsResults = await this.postsQueryRepository.getPostsById(
      postId,
      // user?.userId
    )

    if (!blogsPostsResults) {
      throw new NotFoundException(`Posts with id ${postId} not found`);
    }

    return blogsPostsResults;
  }
}
