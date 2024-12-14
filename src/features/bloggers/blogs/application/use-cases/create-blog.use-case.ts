import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { v4 as uuidv4 } from 'uuid';

import { BlogInputModel } from "../../api/models/input/blog.input.model";

import { BlogsTypeormRepository } from "../../infra/blog-typeorm.repository";

import { BlogTypeorm } from "../../domain/blogs-typeorm.entity";

export class CreateBlogCommand {
  constructor (
    public readonly body: BlogInputModel
  ) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor (
    private readonly blogsRepository: BlogsTypeormRepository
  ) {}

  async execute(command: CreateBlogCommand): Promise<BlogTypeorm> {
      const { body } = command
      
      const newBlog = {
        id: uuidv4(),
        name: body.name,
        description: body.description,
        websiteUrl: body.websiteUrl,
        createdAt: new Date,
        isMembership: false
      }  as BlogTypeorm
      
      const createdResult = await this.blogsRepository.createBlog(newBlog) as BlogTypeorm

      return createdResult
  }
}