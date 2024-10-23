import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

import { Blog } from "../domain/blogs.entity";
import { BlogViewModel } from "../api/models/output";

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectDataSource()
    protected dataSource: DataSource
  ) {}  

  public async createBlog(newBlog: Blog): Promise<Blog> {
    const query = `
      INSERT INTO "blogs"
      (id, name, description, "websiteUrl", "createdAt", "isMembership")
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `

    const result = await this.dataSource.query(
      query,
      [
        newBlog.id,
        newBlog.name,
        newBlog.description,
        newBlog.websiteUrl,
        newBlog.createdAt,
        newBlog.isMembership
      ]
    )

    return newBlog
  }
}