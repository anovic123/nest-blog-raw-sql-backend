import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";

import { BlogsController } from "./blogs/api/blogs.controller";
import { BlogsAdminController } from "./blogs/api/blogs-admin.controller";

import { BlogsRepository } from "./blogs/infra/blogs.repository";

import { CreateBlogUseCase } from "./blogs/application/use-cases/create-blog.use-case";
import { BlogsQueryRepository } from "./blogs/infra/blogs-query.repository";

@Module({
  imports: [
    CqrsModule,
  ],
  controllers: [ BlogsController, BlogsAdminController ],
  providers: [
    CreateBlogUseCase,
    BlogsRepository,
    BlogsQueryRepository
  ],
  exports: []
})
export class BloggersModule {}
