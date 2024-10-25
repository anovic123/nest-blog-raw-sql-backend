import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

import { GetBlogPostsHelperResult } from "../../blogs/helper";

import { PaginatedResponse } from "src/base/types/pagination";

import { BlogPostOutputModel, BlogPostViewModel, LikePostStatus } from "../../blogs/api/models/output";

@Injectable()
export class PostsQueryRepository {
  constructor (
    @InjectDataSource()
    protected readonly dataSource: DataSource
  ) {}

  public async getBlogPosts(
    pagination: GetBlogPostsHelperResult,
    postId?: string,
    userId?: string | null | undefined,
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
  
    const paginationResult = {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize,
      totalCount,
      items: blogsPostResult.length > 0 ? blogsPostResult.map((p: BlogPostViewModel) => this.mapPostOutput(p)) : [],
    };
  
    return paginationResult as any;
  }

  public async getPostsById(id: BlogPostViewModel['id']): Promise<BlogPostOutputModel | null> {
    const query = `
      SELECT * FROM "posts" WHERE "id" = $1
    `

    const res = await this.dataSource.query(query, [id])

    return res.length > 0 ? res.map((p: BlogPostViewModel) => this.mapPostOutput(p)) : null;
  }
  
  public mapPostOutput(post: BlogPostViewModel, userId?: string | null | undefined): BlogPostOutputModel{
    const postForOutput = {
     id: post.id,
     title: post.title,
     shortDescription: post.shortDescription,
     content: post.content,
     blogId: post.blogId,
     blogName: post.blogName,
     createdAt: post.createdAt,
     extendedLikesInfo: {
       likesCount: 0,
       dislikesCount: 0,
       myStatus: LikePostStatus.NONE,
       newestLikes: []
     }
    } 
 
    return postForOutput;
   }
}