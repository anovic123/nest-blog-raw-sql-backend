import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { NotFoundException } from "@nestjs/common";

import { BlogViewModel } from "../../api/models/output";

import { BlogsTypeormRepository } from "../../infra/blog-typeorm.repository";

export class DeleteBlogCommand {
  constructor (
    public readonly id: BlogViewModel['id']
  ) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(private blogsRepository: BlogsTypeormRepository) {}

  async execute(command: DeleteBlogCommand) {
    const { id } = command;

    const res = await this.blogsRepository.deleteBlog(id)

    if (!res) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }
  }
}
