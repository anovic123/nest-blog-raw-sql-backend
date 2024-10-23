import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";

import { BasicAuthGuard } from "src/core/guards/auth-basic.guards";

import { BlogsQueryRepository } from "../infra/blogs-query.repository";

import { Blog } from "../domain/blogs.entity";

import { BlogInputModel } from "./models/input/blog.input.model";
import { Pagination } from "src/base/models/pagination.base.model";

import { CreateBlogCommand } from "../application/use-cases/create-blog.use-case";

import { SortingPropertiesType } from "src/base/types/sorting-properties.type";

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
}