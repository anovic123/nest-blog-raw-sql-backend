import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';


@Injectable()
export class TestingRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  public async deleteAll(): Promise<boolean> {
    try {
      const userTable = `
        TRUNCATE TABLE "users" RESTART IDENTITY CASCADE
      `;

      const devicesTable = `
        TRUNCATE TABLE "devices" RESTART IDENTITY CASCADE
      `

      const blogsTable = `
        TRUNCATE TABLE "blogs" RESTART IDENTITY CASCADE
      `

      const postsTable = `
        TRUNCATE TABLE "posts" RESTART IDENTITY CASCADE
      `

      const commentsTable = `
        TRUNCATE TABLE "comments" RESTART IDENTITY CASCADE
      `

      const likesPostsTable = `
        TRUNCATE TABLE "like-posts" RESTART IDENTITY CASCADE
      `

      const likeCommentsTable = `
        TRUNCATE TABLE "like-comments" RESTART IDENTITY CASCADE
      `

      await this.dataSource.query(userTable)
      await this.dataSource.query(devicesTable)
      await this.dataSource.query(blogsTable)
      await this.dataSource.query(postsTable)
      await this.dataSource.query(commentsTable)
      await this.dataSource.query(likesPostsTable)
      await this.dataSource.query(likeCommentsTable)

      return true
    } catch (error) {
      console.error(error)
      return false;
    }
  }
}