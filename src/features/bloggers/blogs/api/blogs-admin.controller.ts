import { Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Post, Put, Query, Req, UseGuards } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";

import { BasicAuthGuard } from "src/core/guards/auth-basic.guards";

import { BlogsQueryRepository } from "../infra/blogs-query.repository";

import { Blog } from "../domain/blogs.entity";

import { BlogInputModel } from "./models/input/blog.input.model";
import { Pagination } from "src/base/models/pagination.base.model";

import { CreateBlogCommand } from "../application/use-cases/create-blog.use-case";

import { SortingPropertiesType } from "src/base/types/sorting-properties.type";
import { UpdateBlogCommand, UpdateBlogUseCase } from "../application/use-cases/update-blog.use-case";
import { DeleteBlogCommand } from "../application/use-cases/delete-blog.use-case";
import { BlogPostViewModel, BlogViewModel } from "./models/output";
import { BlogPostInputModel } from "./models/input/blog-post.input.model";
import { CreatePostBlogCommand } from "../application/use-cases/create-post-blog.use-case";
import { Public } from "src/core/decorators/public.decorator";
import { RequestWithUser } from "src/base/types/request";
import { PostInputModel } from "./models/input/create-post.input.model";
import { UpdateBlogPostCommand } from "../application/use-cases/update-blog-post.use-case";
import { DeleteBlogPostCommand } from "../application/use-cases/delete-post-blog.use-case";

export const BLOGS_SORTING_PROPERTIES: SortingPropertiesType<Blog> = ['createdAt', 'description', 'id', 'isMembership', 'name', 'websiteUrl']

@Controller("sa/blogs")
export class BlogsAdminController {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly commandBus: CommandBus
  ) {}
  
  @UseGuards(BasicAuthGuard)
  @Post()
  public async createBlog(@Body() createBlogModel: BlogInputModel) {
    return this.commandBus.execute(new CreateBlogCommand(createBlogModel))
  }

  @UseGuards(BasicAuthGuard)
  @Get()
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
  public async putBlogs(
    @Body() body: BlogInputModel, @Param('id') id: string
  ) {
    return this.commandBus.execute(new UpdateBlogCommand(body, id))
  }

  @UseGuards(BasicAuthGuard)
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteBlog(@Param('id') id: string) {
    return this.commandBus.execute(new DeleteBlogCommand(id))
  }

  @UseGuards(BasicAuthGuard)
  @Post('/:blogId/posts')
  public async createBlogsPost(
    @Param('blogId') blogId: BlogPostViewModel['blogId'],
    @Body() body: BlogPostInputModel
  ) {
    return this.commandBus.execute(new CreatePostBlogCommand(blogId, body))
  }

  @Public()
  @UseGuards(BasicAuthGuard)
  @Get('/:blogId/posts')
  public async getBlogPosts(
    @Param('blogId') blogId: string,
    @Query() query: { [key: string]: string | undefined },
    @Req() request: RequestWithUser,
  ) {
    const user = request['user']
    
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

  @UseGuards(BasicAuthGuard)
  @Put('/:blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async updateBlogPost(
    @Body() body: PostInputModel,
    @Param('blogId') blogId: BlogViewModel['id'],
    @Param('postId') postId: BlogPostViewModel['id']
  ) {
    return this.commandBus.execute(new UpdateBlogPostCommand(body, blogId, postId))
  }

  @UseGuards(BasicAuthGuard)
  @Delete('/:blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteBlogPost(
    @Param('blogId') blogId: BlogViewModel['id'],
    @Param('postId') postId: BlogPostViewModel['id']
  ) {
    return this.commandBus.execute(new DeleteBlogPostCommand(blogId, postId))
  }
}