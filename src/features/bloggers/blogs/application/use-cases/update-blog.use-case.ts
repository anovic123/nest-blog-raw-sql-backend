import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { NotFoundException } from "@nestjs/common";

import { BlogInputModel } from "../../api/models/input/blog.input.model";
import { BlogViewModel } from "../../api/models/output";

import { BlogsTypeormRepository } from "../../infra/blog-typeorm.repository";

export class UpdateBlogCommand {
  constructor(
    public readonly body: BlogInputModel,
    public readonly id: BlogViewModel['id']
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(
    private readonly blogsRepository: BlogsTypeormRepository
  ) {}

  async execute(command: UpdateBlogCommand): Promise<boolean> {
      const { body, id } = command
    
      const res = await this.blogsRepository.updateBlog(body, id)

      if (!res) {
        throw new NotFoundException(`Blog with id ${id} not found`);
      }
  
      return res;
  }
}