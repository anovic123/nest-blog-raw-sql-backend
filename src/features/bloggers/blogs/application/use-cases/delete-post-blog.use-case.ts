import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { NotFoundException } from "@nestjs/common";

import { PostsRepository } from "src/features/bloggers/posts/infra/posts.repository";

import { BlogPostViewModel, BlogViewModel } from "../../api/models/output";

import { BlogsQueryRepository } from "../../infra/blogs-query.repository";

export class DeleteBlogPostCommand {
  constructor (
    public readonly blogId: BlogViewModel['id'],
    public readonly postId: BlogPostViewModel['id']
  ) {}
}

@CommandHandler(DeleteBlogPostCommand)
export class DeleteBlogPostUseCase implements ICommandHandler<DeleteBlogPostCommand> {
  constructor (
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsQueryRepository
  ) {}

  async execute(command: DeleteBlogPostCommand) {
    const isBlogExisted = await this.blogsRepository.findBlog(command.blogId)

    if (!isBlogExisted) {
      throw new NotFoundException();
    }

    const isPostExisted = await this.postsRepository.isPostExisted(command.postId)

    if (!isPostExisted) {
      throw new NotFoundException();
    }

    const result = await this.postsRepository.deletePost(command.postId)

    if (!result) {
      throw new NotFoundException(`Post with id ${command.postId} not found`);
    }
  }
}