import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Blog } from "./blogs/domain/blogs.entity";
import { LikePosts } from "./posts/domain/like-post.entity";
import { Posts } from "./posts/domain/posts.entity";
import { Comments } from "./comments/domain/comments.entity";
import { LikeComment } from "./comments/domain/like-comment.entity";

import { BlogsController } from "./blogs/api/blogs.controller";
import { BlogsAdminController } from "./blogs/api/blogs-admin.controller";
import { PostsController } from "./posts/api/posts.controller";
import { CommentsController } from "./comments/api/comments.controller";

import { CreateBlogUseCase } from "./blogs/application/use-cases/create-blog.use-case";
import { UpdateBlogUseCase } from "./blogs/application/use-cases/update-blog.use-case";
import { DeleteBlogUseCase } from "./blogs/application/use-cases/delete-blog.use-case";
import { CreatePostBlogUseCase } from "./blogs/application/use-cases/create-post-blog.use-case";
import { UpdateBlogPostUseCase } from "./blogs/application/use-cases/update-blog-post.use-case";
import { DeleteBlogPostUseCase } from "./blogs/application/use-cases/delete-post-blog.use-case";

import { CreatePostCommentUseCase } from "./posts/application/use-cases/create-post-comment";
import { CommentsRepository } from "./comments/infra/comments.repository";
import { CommentsQueryRepository } from "./comments/infra/comments.query.repository";
import { DeleteCommentUseCase } from "./comments/application/use-cases/delete-comment.use-case";
import { UpdateCommentUseCase } from "./comments/application/use-cases/update-comment.use-case";
import { LikePostUseCase } from "./posts/application/use-cases/like-post.use-case";
import { LikeCommentUseCase } from "./comments/application/use-cases/like-comment.use-case";
import { BlogsTypeormQueryRepository } from "./blogs/infra/blogs-typeorm-query.repository";
import { BlogTypeorm } from "./blogs/domain/blogs-typeorm.entity";
import { PostsTypeorm } from "./posts/domain/post-typeorm.entity";
import { UsersTypeormRepository } from "../users/infra/users-typeorm.repository";
import { PostsTypeormQueryRepository } from "./posts/infra/posts-typeorm-query.repository";
import { PostsTypeormRepository } from "./posts/infra/posts-typeorm.repository";
import { BlogsTypeormRepository } from "./blogs/infra/blog-typeorm.repository";
import { UsersModule } from "src/features/users/users.module";

@Module({
  imports: [
    CqrsModule,
    UsersModule,
    TypeOrmModule.forFeature([BlogTypeorm, LikePosts, PostsTypeorm, LikeComment])
  ],
  controllers: [ 
    BlogsController, 
    BlogsAdminController, 
    PostsController, 
    CommentsController 
  ],
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
    BlogsTypeormRepository,
    PostsTypeormRepository,
    BlogsTypeormQueryRepository,
    PostsTypeormQueryRepository,
    CommentsRepository,
    CommentsQueryRepository,
  ],
  exports: [
    PostsTypeormRepository,
    BlogsTypeormRepository
  ]
})
export class BloggersModule {}
