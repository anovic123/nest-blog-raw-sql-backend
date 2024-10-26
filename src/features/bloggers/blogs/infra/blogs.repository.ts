import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

import { BlogPostViewModel, BlogViewModel, LikePostStatus } from "../api/models/output";
import { BlogInputModel } from "../api/models/input/blog.input.model";

import { Blog } from "../domain/blogs.entity";

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectDataSource()
    protected dataSource: DataSource
  ) {}  

  public async createBlog(newBlog: Blog) {
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

    const newBlogResult = {
      ...newBlog,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: "None",
        newestLikes: []
      }
    }

    return newBlogResult
  }

  public async updateBlog(
    blog: BlogInputModel,
    id: BlogViewModel['id']
  ): Promise<boolean> {
    const { name, description, websiteUrl } = blog

    const query = `
      UPDATE "blogs" SET "name" = $1,
      "description" = $2,
      "websiteUrl" = $3 WHERE "id" = $4
    `
  
    const result = await this.dataSource.query(
      query,
      [
        name,
        description,
        websiteUrl,
        id
      ]
    )

    return result[1] === 1
  }

  public async blogIsExist(id: string): Promise<boolean> {
    const query = `
      SELECT Count(*) FROM "blogs" WHERE id = $1
    `

    const res = await this.dataSource.query(query, [id])

    return parseInt(res[0].count, 10) > 0
  }
  
  public async deleteBlog(id: BlogViewModel['id']): Promise<boolean> {
    const query = `
      DELETE FROM "blogs" WHERE id = $1
    `

    const res = await this.dataSource.query(query, [id])
    
    return !!res[1]
  }

  public async createPostBlog(newPost: BlogPostViewModel): Promise<BlogPostViewModel> {
    const { id, blogId, blogName, content, createdAt, shortDescription, title } = newPost
 
    const query = `
      INSERT INTO "posts"
      (id, "shortDescription", content, "blogId", "blogName", "createdAt", "title")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `

    const result = await this.dataSource.query(
      query,
      [
        id,
        shortDescription,
        content,
        blogId,
        blogName,
        createdAt,
        title
      ]
    )

    const newPostResult = {
      ...newPost,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikePostStatus.NONE,
        newestLikes: []
      }
    }

    return newPostResult
  }
}