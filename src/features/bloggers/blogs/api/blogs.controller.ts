import { Controller, UseGuards } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { BasicAuthGuard } from "src/core/guards/auth-basic.guards";

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly commandBus: CommandBus
  ) {}


  // sa
  @UseGuards(BasicAuthGuard)
  @Post()
}