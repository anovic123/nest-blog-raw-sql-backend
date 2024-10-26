import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

import { getAllBlogsHelper, GetAllBlogsHelperResult, GetBlogPostsHelperResult } from "../helper";

import { Blog } from "../domain/blogs.entity";

import { PaginatedResponse } from "src/base/types/pagination";

import { BlogPostOutputModel, BlogPostViewModel, BlogViewModel, LikePostStatus } from "../api/models/output";

import { Pagination, PaginationType } from "src/base/models/pagination.base.model";

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectDataSource()
    protected dataSource: DataSource
  ) {}  

  public async getAllBlogs(
    pagination: PaginationType,
  ): Promise<PaginatedResponse<BlogViewModel>> {
    const { 
      pageNumber,
      pageSize,
      sortBy, 
      searchNameTerm,
      sortDirection,
    } = pagination;
  
    const search = searchNameTerm ? `
      WHERE "name" ILIKE '%${searchNameTerm}%'` : '';

    const query = `
      SELECT * FROM "blogs"
      ${search}
      ORDER BY "${sortBy}" ${sortDirection.toUpperCase()}
      LIMIT ${pageSize} OFFSET ${(pageNumber - 1) * pageSize};
    `;
  
    const blogsResult = await this.dataSource.query(query);
  
    const totalCountQuery = `
      SELECT COUNT(*) FROM "blogs"
      ${search};
    `;
  
    const totalCountRes = await this.dataSource.query(totalCountQuery);
    const totalCount = parseInt(totalCountRes[0].count, 10);

    const paginationResult = {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize,
      totalCount,
      items: blogsResult,
    };
  
    return paginationResult;
  }
  
  public async findBlog(blogId: BlogViewModel['id']): Promise<BlogViewModel | null> {
    const query = `
      SELECT * FROM "blogs" WHERE "id" = $1
    `

    const res = await this.dataSource.query(query, [blogId])
  
    return res.length > 0 ? res[0] : null
  }

  public async getBlogPosts(
    pagination: PaginationType,
    blogId: string,
    userId?: string | null | undefined,
  ): Promise<PaginatedResponse<BlogPostOutputModel>> {
    const { 
      pageNumber,
      pageSize,
      sortBy, 
      searchNameTerm,
      sortDirection,
    } = pagination;
  

    const query = `
      SELECT * FROM "posts"
      WHERE "blogId" = $1
      ORDER BY "${sortBy}" ${sortDirection}
      LIMIT $2 OFFSET $3;
    `;
  
    const offset = (pageNumber - 1) * pageSize;
    const blogsPostResult = await this.dataSource.query(query, [blogId, pageSize, offset]);
  
    const totalCountQuery = `
      SELECT COUNT(*) FROM "posts"
      WHERE "blogId" = $1;
    `;
    const totalCountRes = await this.dataSource.query(totalCountQuery, [blogId]);
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