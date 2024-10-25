import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";

import { BlogsController } from "./blogs/api/blogs.controller";
import { BlogsAdminController } from "./blogs/api/blogs-admin.controller";
import { PostsController } from "./posts/api/posts.controller";

import { BlogsRepository } from "./blogs/infra/blogs.repository";
import { PostsRepository } from "./posts/infra/posts.repository";
import { BlogsQueryRepository } from "./blogs/infra/blogs-query.repository";
import { PostsQueryRepository } from "./posts/infra/posts.query.repository";

import { CreateBlogUseCase } from "./blogs/application/use-cases/create-blog.use-case";
import { UpdateBlogUseCase } from "./blogs/application/use-cases/update-blog.use-case";
import { DeleteBlogUseCase } from "./blogs/application/use-cases/delete-blog.use-case";
import { CreatePostBlogUseCase } from "./blogs/application/use-cases/create-post-blog.use-case";
import { UpdateBlogPostUseCase } from "./blogs/application/use-cases/update-blog-post.use-case";

import { PostIsExistConstraint } from "src/core/decorators/validate/is-post-exist.decorator";
import { BlogIsExistConstraint } from "src/core/decorators/validate/is-blog-exist.decorator";

@Module({
  imports: [
    CqrsModule,
  ],
  controllers: [ BlogsController, BlogsAdminController, PostsController ],
  providers: [
    CreateBlogUseCase,
    UpdateBlogUseCase,
    DeleteBlogUseCase,
    CreatePostBlogUseCase,
    UpdateBlogPostUseCase,
    DeleteBlogUseCase,
    BlogsRepository,
    PostsRepository,
    BlogsQueryRepository,
    PostsQueryRepository,
    PostIsExistConstraint,
    BlogIsExistConstraint
  ],
  exports: []
})
export class BloggersModule {}
