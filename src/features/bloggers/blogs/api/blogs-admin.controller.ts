import { Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Post, Put, Query, Req, UseGuards } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ApiBasicAuth, ApiExtraModels, ApiOperation, ApiQuery, ApiResponse, ApiTags, getSchemaPath } from "@nestjs/swagger";

import { BasicAuthGuard } from "src/core/guards/auth-basic.guards";

import { BlogsTypeormQueryRepository } from "src/features/bloggers/blogs/infra/blogs-typeorm-query.repository";

import { Blog } from "../domain/blogs.entity";

import { BlogInputModel } from "./models/input/blog.input.model";
import { Pagination, PaginationOutput, PaginationQueryDto } from "src/base/models/pagination.base.model";
import { BlogPostInputModel } from "./models/input/blog-post.input.model";
import { UpdatePostInputModel } from "./models/input/update-post.input.model";
import { ErrorResponseDto } from "src/base/models/errors-messages.base.model";

import { CreateBlogCommand } from "../application/use-cases/create-blog.use-case";
import { UpdateBlogCommand } from "../application/use-cases/update-blog.use-case";
import { DeleteBlogCommand } from "../application/use-cases/delete-blog.use-case";
import { CreatePostBlogCommand } from "../application/use-cases/create-post-blog.use-case";
import { UpdateBlogPostCommand } from "../application/use-cases/update-blog-post.use-case";
import { DeleteBlogPostCommand } from "../application/use-cases/delete-post-blog.use-case";

import { SortingPropertiesType } from "src/base/types/sorting-properties.type";

import { BlogPostOutputModel, BlogPostViewModel, BlogViewModel } from "./models/output";

import { Public } from "src/core/decorators/public.decorator";

import { RequestWithUser } from "src/base/types/request";

export const BLOGS_SORTING_PROPERTIES: SortingPropertiesType<Blog> = ['createdAt', 'description', 'id', 'isMembership', 'name', 'websiteUrl']
export const POSTS_SORTING_PROPERTIES: SortingPropertiesType<BlogPostViewModel> = ['blogId', 'blogName', 'content', 'createdAt', 'id', 'shortDescription', 'title']

@ApiTags('Admin Blogs')
@ApiBasicAuth()
@Controller("sa/blogs")
export class BlogsAdminController {
  constructor(
    private readonly blogsQueryRepository: BlogsTypeormQueryRepository,
    private readonly commandBus: CommandBus
  ) {}
  
  @UseGuards(BasicAuthGuard)
  @Post()
  @ApiOperation({
    summary: 'Create blog',
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: "Create Blog", type: BlogInputModel })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "If the inputModel has incorrect values", type: ErrorResponseDto })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Unauthorized" })
  public async createBlog(@Body() createBlogModel: BlogInputModel) {
    return this.commandBus.execute(new CreateBlogCommand(createBlogModel))
  }

  @UseGuards(BasicAuthGuard)
  @Get()
  @ApiExtraModels(PaginationOutput, BlogViewModel)
  @Get()
    @ApiQuery({ name: 'Pagination Query', type: PaginationQueryDto })
    @ApiResponse({
      status: HttpStatus.OK,
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

  @UseGuards(BasicAuthGuard)
  @Put('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Update existing Blog by id with InputModel',
  })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: "Updated Blog", type: BlogInputModel })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "If the inputModel has incorrect values", type: ErrorResponseDto })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Unauthorized" })
  public async putBlogs(
    @Body() body: BlogInputModel, @Param('id') id: string
  ) {
    return this.commandBus.execute(new UpdateBlogCommand(body, id))
  }

  @UseGuards(BasicAuthGuard)
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete blog specified by id',
  })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: "Deleted Blog" })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Unauthorized" })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Not Found", type: ErrorResponseDto })
  public async deleteBlog(@Param('id') id: string) {
    return this.commandBus.execute(new DeleteBlogCommand(id))
  }

  @UseGuards(BasicAuthGuard)
  @Post('/:blogId/posts')
  @ApiOperation({
    summary: 'Create new post for specific blog',
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: "Returns the newly created post", type: BlogPostOutputModel })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Not Found", type: ErrorResponseDto })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "If the inputModel has incorrect values", type: ErrorResponseDto })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Unauthorized" })
  public async createBlogsPost(
    @Param('blogId') blogId: string,
    @Body() body: BlogPostInputModel
  ) {
    return this.commandBus.execute(new CreatePostBlogCommand(blogId, body))
  }

  @Public()
  @UseGuards(BasicAuthGuard)
  @Get('/:blogId/posts')
  @ApiExtraModels(PaginationOutput, BlogPostOutputModel)
  @ApiQuery({ name: 'Pagination Query', type: PaginationQueryDto })
  @ApiResponse({
    status: HttpStatus.OK,
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
  @ApiOperation({
    summary: 'Returns posts for blog with paging and sorting',
  })
  @ApiResponse({ status: HttpStatus.OK, description: "Success", type: BlogPostOutputModel })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Unauthorized" })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Not Found" })
  public async getBlogPosts(
    @Param('blogId') blogId: string,
    @Query() query,
    @Req() request: RequestWithUser,
  ) {
    const pagination = new Pagination(
      query,
      POSTS_SORTING_PROPERTIES
    )

    const user = request['user']
    
    const blogsPostsResults = await this.blogsQueryRepository.getBlogPosts(
      pagination,
      blogId,
      user?.userId
    )

    if (!blogsPostsResults || blogsPostsResults.items.length === 0) {
      throw new NotFoundException(`Blog posts with id ${blogId} not found`);
    }

    return blogsPostsResults;
  }

  @UseGuards(BasicAuthGuard)
  @Put('/:blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Update existing post by id with InputModel',
  })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: "Updated Blog" })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Unauthorized" })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Not Found", type: ErrorResponseDto })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "If the inputModel has incorrect values", type: ErrorResponseDto })
  public async updateBlogPost(
    @Body() body: UpdatePostInputModel,
    @Param('blogId') blogId: BlogViewModel['id'],
    @Param('postId') postId: BlogPostViewModel['id']
  ) {
    return this.commandBus.execute(new UpdateBlogPostCommand(body, blogId, postId))
  }

  @UseGuards(BasicAuthGuard)
  @Delete('/:blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete post specified by id',
  })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: "Deleted Blog" })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Unauthorized" })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Not Found", type: ErrorResponseDto })
  public async deleteBlogPost(
    @Param('blogId') blogId: BlogViewModel['id'],
    @Param('postId') postId: BlogPostViewModel['id']
  ) {
    return this.commandBus.execute(new DeleteBlogPostCommand(blogId, postId))
  }
}