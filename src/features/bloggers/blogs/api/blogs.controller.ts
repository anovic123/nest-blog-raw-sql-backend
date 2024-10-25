import { Controller, Get, HttpCode, HttpStatus, NotFoundException, Param, Query, Req } from "@nestjs/common";

import { Pagination } from "src/base/models/pagination.base.model";

import { BlogsQueryRepository } from "../infra/blogs-query.repository";

import { RequestWithUser } from "src/base/types/request";

import { BLOGS_SORTING_PROPERTIES } from "./blogs-admin.controller";

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}

  @Get()
  public async getBlogs(@Query() query) {
    const pagination = new Pagination(
      query,
      BLOGS_SORTING_PROPERTIES
    )
    return this.blogsQueryRepository.getAllBlogs(pagination)
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  public async getBlogsById(@Param('id') id) {
    const blog = await this.blogsQueryRepository.findBlog(id)

    if (!blog) {
      throw new NotFoundException()
    }

    return blog
  }

  @Get('/:blogId/posts')
  @HttpCode(HttpStatus.OK)
  public async getBlogPostsById(@Param('blogId') blogId,
  @Query() query: { [key: string]: string | undefined },
  @Req() request: RequestWithUser,) {
    const user = request['user']

    const isBlogExisted = await this.blogsQueryRepository.findBlog(blogId)

    if (!isBlogExisted) {
      throw new NotFoundException()
    }

    const blogsPostsResults = await this.blogsQueryRepository.getBlogPosts(
      query,
      blogId,
      user?.userId
    )

    if (!blogsPostsResults || blogsPostsResults.items.length === 0) {
      throw new NotFoundException(`Blog posts with id ${blogId} not found`);
    }

    return blogsPostsResults;
  }
}
