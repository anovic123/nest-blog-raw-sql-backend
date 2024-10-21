import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { BlogsController } from "./blogs/api/blogs.controller";

@Module({
  imports: [
    CqrsModule
  ],
  controllers: [ BlogsController ],
  providers: [],
  exports: []
})
export class BloggersModule {}
