import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { NotFoundException } from "@nestjs/common";

import { UpdatePostInputModel } from "../../api/models/input/update-post.input.model";
import { BlogPostViewModel, BlogViewModel } from "../../api/models/output";

import { BlogsTypeormQueryRepository } from "../../infra/blogs-typeorm-query.repository";
import { PostsTypeormRepository } from "src/features/bloggers/posts/infra/posts-typeorm.repository";

export class UpdateBlogPostCommand {
  constructor (
    public readonly body: UpdatePostInputModel,
    public readonly blogId: BlogViewModel['id'],
    public readonly postId: BlogPostViewModel['id']
  ) {}
}

@CommandHandler(UpdateBlogPostCommand)
export class UpdateBlogPostUseCase implements ICommandHandler<UpdateBlogPostCommand> {
  constructor (
    private readonly blogsRepository: BlogsTypeormQueryRepository,
    private readonly postsRepository: PostsTypeormRepository
  ) {}

  async execute(command: UpdateBlogPostCommand) {
      const { body, blogId, postId } = command;

     const blog = await this.blogsRepository.findBlog(blogId)

     if (!blog) {
      throw new NotFoundException(`blog with id ${blogId} not found`)
     }

     const post = await this.postsRepository.isPostExisted(postId)

     if (!post) {
      throw new NotFoundException(`post with id ${postId} not found`)
     }

     return await this.postsRepository.updatePost(body, postId, blogId)
  }
}