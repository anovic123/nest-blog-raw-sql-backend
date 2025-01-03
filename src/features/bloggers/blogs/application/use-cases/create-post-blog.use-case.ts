import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { NotFoundException } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid"; 

import { BlogPostInputModel } from "../../api/models/input/blog-post.input.model";
import { BlogPostViewModel, BlogViewModel } from "../../api/models/output";

import { BlogsTypeormQueryRepository } from "../../infra/blogs-typeorm-query.repository";
import { PostsTypeormRepository } from "src/features/bloggers/posts/infra/posts-typeorm.repository";

export class CreatePostBlogCommand {
  constructor(
    public readonly blogId: BlogViewModel['id'],
    public readonly body: BlogPostInputModel
  ) {}
}

@CommandHandler(CreatePostBlogCommand)
export class CreatePostBlogUseCase implements ICommandHandler<CreatePostBlogCommand> {
  constructor (
    private readonly postsRepository: PostsTypeormRepository,
    private readonly blogsQueryRepository: BlogsTypeormQueryRepository
  ) {}

  async execute(command: CreatePostBlogCommand): Promise<BlogPostViewModel> {
      const { blogId, body } = command;

      const findBlog = await this.blogsQueryRepository.findBlog(blogId);
      if (!findBlog) {
        throw new NotFoundException(`Blog with id ${blogId} not found`);
      }

      const newPost: BlogPostViewModel = {
        id: uuidv4(),
        title: body.title,
        shortDescription: body.shortDescription,
        content: body.content,
        blogId: findBlog.id,
        blogName: findBlog.name,
        createdAt: new Date()
      } 

      return this.postsRepository.createPostBlog(newPost)
  }
}