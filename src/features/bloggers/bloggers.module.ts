import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";

import { BlogsController } from "./blogs/api/blogs.controller";
import { BlogsAdminController } from "./blogs/api/blogs-admin.controller";
import { PostsController } from "./posts/api/posts.controller";
import { CommentsController } from "./comments/api/comments.controller";

import { BlogsRepository } from "./blogs/infra/blogs.repository";
import { PostsRepository } from "./posts/infra/posts.repository";
import { BlogsQueryRepository } from "./blogs/infra/blogs-query.repository";
import { PostsQueryRepository } from "./posts/infra/posts.query.repository";

import { CreateBlogUseCase } from "./blogs/application/use-cases/create-blog.use-case";
import { UpdateBlogUseCase } from "./blogs/application/use-cases/update-blog.use-case";
import { DeleteBlogUseCase } from "./blogs/application/use-cases/delete-blog.use-case";
import { CreatePostBlogUseCase } from "./blogs/application/use-cases/create-post-blog.use-case";
import { UpdateBlogPostUseCase } from "./blogs/application/use-cases/update-blog-post.use-case";
import { DeleteBlogPostUseCase } from "./blogs/application/use-cases/delete-post-blog.use-case";

import { PostIsExistConstraint } from "src/core/decorators/validate/is-post-exist.decorator";
import { BlogIsExistConstraint } from "src/core/decorators/validate/is-blog-exist.decorator";
import { CreatePostCommentUseCase } from "./posts/application/use-cases/create-post-comment";
import { CommentsRepository } from "./comments/infra/comments.repository";
import { UsersRepository } from "../users/infra/users.repository";
import { CommentsQueryRepository } from "./comments/infra/comments.query.repository";
import { DeleteCommentUseCase } from "./comments/application/use-cases/delete-comment.use-case";
import { UpdateCommentUseCase } from "./comments/application/use-cases/update-comment.use-case";
import { LikePostUseCase } from "./posts/application/use-cases/like-post.use-case";
import { LikeCommentUseCase } from "./comments/application/use-cases/like-comment.use-case";

@Module({
  imports: [
    CqrsModule,
  ],
  controllers: [ BlogsController, BlogsAdminController, PostsController, CommentsController ],
  providers: [
    CreateBlogUseCase,
    UpdateBlogUseCase,
    DeleteBlogUseCase,
    CreatePostBlogUseCase,
    DeleteBlogPostUseCase,
    UpdateBlogPostUseCase,
    DeleteBlogUseCase,
    CreatePostCommentUseCase,
    DeleteCommentUseCase,
    UpdateCommentUseCase,
    LikePostUseCase,
    LikeCommentUseCase,
    BlogsRepository,
    PostsRepository,
    BlogsQueryRepository,
    PostsQueryRepository,
    CommentsRepository,
    CommentsQueryRepository,
    UsersRepository,
    PostIsExistConstraint,
    BlogIsExistConstraint
  ],
  exports: []
})
export class BloggersModule {}
