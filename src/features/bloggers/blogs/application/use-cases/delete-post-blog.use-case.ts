import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { NotFoundException } from "@nestjs/common";

import { BlogPostViewModel, BlogViewModel } from "../../api/models/output";

import { PostsTypeormRepository } from "src/features/bloggers/posts/infra/posts-typeorm.repository";
import { BlogsTypeormQueryRepository } from "../../infra/blogs-typeorm-query.repository";

export class DeleteBlogPostCommand {
  constructor (
    public readonly blogId: BlogViewModel['id'],
    public readonly postId: BlogPostViewModel['id']
  ) {}
}

@CommandHandler(DeleteBlogPostCommand)
export class DeleteBlogPostUseCase implements ICommandHandler<DeleteBlogPostCommand> {
  constructor (
    private readonly postsRepository: PostsTypeormRepository,
    private readonly blogsRepository: BlogsTypeormQueryRepository
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