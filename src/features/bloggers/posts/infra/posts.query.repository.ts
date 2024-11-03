import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

import { GetBlogPostsHelperResult } from "../../blogs/helper";

import { PaginatedResponse } from "src/base/types/pagination";

import { BlogPostOutputModel, BlogPostViewModel, LikePostStatus } from "../../blogs/api/models/output";
import { PostViewModel } from "../api/output";
import { User } from "src/features/users/domain/users.entity";
import { LikePosts } from "../domain/like-post.entity";

@Injectable()
export class PostsQueryRepository {
  constructor (
    @InjectDataSource()
    protected readonly dataSource: DataSource
  ) {}

  public async getBlogPosts(
    pagination: GetBlogPostsHelperResult,
    userId?: string | null | undefined,
    postId?: string,
  ): Promise<PaginatedResponse<BlogPostOutputModel>> {
    const { 
      pageNumber = 1,
      pageSize = 10,
      sortBy = 'createdAt',
      sortDirection = 'ASC',
    } = pagination;
  
    const sortDirectionUpper = sortDirection.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const offset = (pageNumber - 1) * pageSize;
    
    const query = `
      SELECT * FROM "posts"
      ${postId ? 'WHERE "id" = $1' : ''}
      ORDER BY "${sortBy}" ${sortDirectionUpper}
      LIMIT $${postId ? '2' : '1'} OFFSET $${postId ? '3' : '2'};
    `;
    const queryParams = postId ? [postId, pageSize, offset] : [pageSize, offset];
    
    const blogsPostResult = await this.dataSource.query(query, queryParams);
  
    const totalCountQuery = `
      SELECT COUNT(*) FROM "posts"
      ${postId ? 'WHERE "id" = $1' : ''};
    `;
    const totalCountParams = postId ? [postId] : [];
    const totalCountRes = await this.dataSource.query(totalCountQuery, totalCountParams);
    const totalCount = parseInt(totalCountRes[0].count, 10);
  
    const mappedItems = blogsPostResult.length > 0 
      ? await Promise.all(blogsPostResult.map((p: BlogPostViewModel) => this.mapPostOutput(p, userId))) 
      : [];
    
    const paginationResult = {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize,
      totalCount,
      items: mappedItems
    };
    
    return paginationResult;
  }
  

  public async getPostsById(id: BlogPostViewModel['id'], userId?: User['id']): Promise<BlogPostOutputModel | null> {
    const query = `
      SELECT * FROM "posts" WHERE "id" = $1
    `

    const res = await this.dataSource.query(query, [id])

    const result = res.length > 0 ? await this.mapPostOutput(res[0], userId) : null;

    return result
  }
  
  public async mapPostOutput(post: BlogPostViewModel, userId?: string | null): Promise<BlogPostOutputModel> {
    const likes = await this.dataSource.query(
      `
        SELECT lp.*, (
          SELECT "login" 
          FROM "users" 
          WHERE "users"."id" = lp."authorId"
        ) AS "login"
        FROM "like-posts" AS lp 
        WHERE lp."postId" = $1
        ORDER BY lp."createdAt" DESC
      `,
      [post.id]
    );
  
    const userLike = userId ? likes.find((l: LikePosts) => l.authorId === userId) : null;
    const likesCount = likes.filter((l: LikePosts) => l.status === LikePostStatus.LIKE).length;
    const dislikesCount = likes.filter((l: LikePosts) => l.status === LikePostStatus.DISLIKE).length;
    const myStatus = userLike?.status ?? LikePostStatus.NONE;
    
    const newestLikes = likes
      .filter((l: LikePosts) => l.status === LikePostStatus.LIKE)
      .slice(0, 3)
      .map(l => ({
        addedAt: l.createdAt.toISOString(),  // Ensuring addedAt is a string
        userId: l.authorId,
        login: l.login
      }));
  
    const postForOutput = {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount,
        dislikesCount,
        myStatus,
        newestLikes
      }
    };
  
    return postForOutput;
  }
}