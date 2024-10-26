import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

import { BlogPostViewModel, BlogViewModel } from "../../blogs/api/models/output";
import { PostInputModel } from "../../blogs/api/models/input/create-post.input.model";
import { UpdatePostInputModel } from "../../blogs/api/models/input/update-post.input.model";

@Injectable()
export class PostsRepository {
  constructor (
    @InjectDataSource() protected readonly dataSource: DataSource
  ) {}

  public async isPostExisted(id: BlogPostViewModel['id']) {
    const query = `
      SELECT COUNT(*) FROM "posts" WHERE id = $1
    `

    const res = await this.dataSource.query(query, [id])

    return parseInt(res[0].count, 10) > 0
  }

  public async updatePost(
    body: UpdatePostInputModel,
    postId: BlogPostViewModel['id'],
    blogId: BlogViewModel['id']
  ): Promise<boolean> {
    const {
      content,
      shortDescription,
      title,      
    } = body

    const query = `
      UPDATE "posts" 
      SET "blogId" = $1,
      "content" = $2,
      "shortDescription" = $3,
      "title" = $4 WHERE "id" = $5
    `

    const result = await this.dataSource.query(
      query,
      [
        blogId,
        content,
        shortDescription,
        title,
        postId
      ]
    )

    return result[1] === 1
  }

  public async deletePost(id: BlogPostViewModel['id']): Promise<boolean> {
    const query = `
      DELETE FROM "posts" WHERE id = $1
    `

    const res = await this.dataSource.query(query, [id])
    
    return !!res[1]
  }
}