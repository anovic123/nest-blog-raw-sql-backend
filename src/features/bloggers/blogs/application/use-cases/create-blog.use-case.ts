import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { v4 as uuidv4 } from 'uuid';

import { BlogInputModel } from "../../api/models/input/blog.input.model";

import { BlogsRepository } from "../../infra/blogs.repository";

import { Blog } from "../../domain/blogs.entity";

export class CreateBlogCommand {
  constructor (
    public readonly body: BlogInputModel
  ) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor (
    private readonly blogsRepository: BlogsRepository
  ) {}

  async execute(command: CreateBlogCommand): Promise<Blog> {
      const { body } = command

      const newBlog = {
        id: uuidv4(),
        name: body.name,
        description: body.description,
        websiteUrl: body.websiteUrl,
        createdAt: new Date,
        isMembership: false
      } 
      const createdResult = await this.blogsRepository.createBlog(newBlog)

      return createdResult
  }
}