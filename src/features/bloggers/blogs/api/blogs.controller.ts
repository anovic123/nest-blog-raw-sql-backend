import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly commandBus: CommandBus
  ) {}
}
