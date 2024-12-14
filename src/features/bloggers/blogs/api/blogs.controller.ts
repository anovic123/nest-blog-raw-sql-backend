import { Controller, Get, HttpCode, HttpStatus, NotFoundException, Param, Query, Req, UseGuards } from "@nestjs/common";
import { ApiExtraModels, ApiOperation, ApiQuery, ApiResponse, ApiTags, getSchemaPath } from "@nestjs/swagger";

import { Pagination, PaginationOutput, PaginationQueryDto } from "src/base/models/pagination.base.model";

import { RequestWithUser } from "src/base/types/request";

import { BLOGS_SORTING_PROPERTIES, POSTS_SORTING_PROPERTIES } from "./blogs-admin.controller";
import { Public } from "src/core/decorators/public.decorator";
import { AuthGuard } from "src/core/guards/auth.guard";

import { BlogPostOutputModel, BlogViewModel } from "./models/output";
import { BlogsTypeormQueryRepository } from "../infra/blogs-typeorm-query.repository";

@ApiTags('Blogs')
@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsQueryRepository: BlogsTypeormQueryRepository,
  ) {}

  @ApiExtraModels(PaginationOutput, BlogViewModel)
  @Get()
  @ApiQuery({ name: 'Pagination Query', type: PaginationQueryDto  })
  @ApiResponse({
    status: 200,
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginationOutput) },
        {
          properties: {
            items: {
              type: 'array',
              items: { $ref: getSchemaPath(BlogViewModel) },
            },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiOperation({
    summary: 'Returns blogs with paging',
  })
  public async getBlogs(@Query() query) {
    const pagination = new Pagination(
      query,
      BLOGS_SORTING_PROPERTIES
    )
    return this.blogsQueryRepository.getAllBlogs(pagination)
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Returns blogs by id',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'No Content', type: BlogViewModel})
  public async getBlogsById(@Param('id') id: string) {
    const blog = await this.blogsQueryRepository.findBlog(id)

    if (!blog) {
      throw new NotFoundException()
    }

    return blog
  }

  @ApiExtraModels(PaginationOutput, BlogPostOutputModel)
  @Public()
  @UseGuards(AuthGuard)
  @Get('/:blogId/posts')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginationOutput) },
        {
          properties: {
            items: {
              type: 'array',
              items: { $ref: getSchemaPath(BlogPostOutputModel) },
            },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiOperation({
    summary: 'Returns all posts for specified blog',
  })
  @ApiQuery({ name: 'Pagination Query', type: PaginationQueryDto  })
  public async getBlogPostsById(@Param('blogId') blogId,
  @Query() query,
  @Req() request: RequestWithUser,) {
    const user = request['user']

    const pagination = new Pagination(
      query,
      POSTS_SORTING_PROPERTIES
    )


    const isBlogExisted = await this.blogsQueryRepository.findBlog(blogId)

    if (!isBlogExisted) {
      throw new NotFoundException()
    }

    const blogsPostsResults = await this.blogsQueryRepository.getBlogPosts(
      pagination,
      blogId,
      user?.userId,
    )

    if (!blogsPostsResults || blogsPostsResults.items.length === 0) {
      throw new NotFoundException(`Blog posts with id ${blogId} not found`);
    }

    return blogsPostsResults;
  }
}
