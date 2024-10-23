import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

import { getAllBlogsHelper, GetAllBlogsHelperResult } from "../helper";

import { Blog } from "../domain/blogs.entity";

import { PaginatedResponse } from "src/base/types/pagination";

import { BlogViewModel } from "../api/models/output";

import { Pagination } from "src/base/models/pagination.base.model";

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectDataSource()
    protected dataSource: DataSource
  ) {}  

  public async getAllBlogs(
    pagination: Pagination,
    blogId?: Blog['id'],
  ): Promise<PaginatedResponse<BlogViewModel>> {
    const { 
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    } = pagination;
  
    const whereClause = blogId ? `WHERE "id" = '${blogId}'` : '';
  
    const query = `
      SELECT * FROM "blogs"
      ${whereClause} 
      ORDER BY "${sortBy}" ${sortDirection.toUpperCase()}
      LIMIT ${pageSize} OFFSET ${(pageNumber - 1) * pageSize};
    `;
  
    const blogsResult = await this.dataSource.query(query);
  
    const totalCountQuery = `
      SELECT COUNT(*) FROM "blogs"
      ${whereClause};
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
  
}