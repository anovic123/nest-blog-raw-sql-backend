import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

import { Posts } from "../../posts/domain/posts.entity";

import { PaginationType } from "src/base/models/pagination.base.model";

import { PaginatedResponse } from "src/base/types/pagination";
import { BlogViewModel } from "../../blogs/api/models/output";
import { Comments } from "../domain/comments.entity";
import { CommentViewModel } from "../api/models/output";
import { User } from "src/features/users/domain/users.entity";



@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource
  ) {}

  public async getPostsComments(
    postId: Posts['id'],
    pagination: PaginationType
  ): Promise<PaginatedResponse<BlogViewModel>> {
    const {
      pageNumber,
      pageSize,
      searchNameTerm,
      sortBy,
      sortDirection
    } = pagination

    const query = `
      SELECT * FROM "comments" WHERE "postId" = $1
      ORDER BY "${sortBy}" ${sortDirection.toUpperCase()}
      LIMIT ${pageSize} OFFSET ${(pageNumber - 1) * pageSize}
    `

    const commentsRes = await this.dataSource.query(query, [postId]);
    const totalCountQuery = `
      SELECT COUNT(*) FROM "blogs" WHERE "id" = $1
    `

    const totalCountRes = await this.dataSource.query(totalCountQuery, [postId])
    const totalCount = parseInt(totalCountRes[0].count, 10)

    const paginationResult = {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize,
      totalCount,
      items: commentsRes.length > 0 ? commentsRes.map((p: Comments) => this.mapPostCommentsOutput(p)) : []
    }
    return paginationResult
  }

  public async getPostsCommentsById(commentsId: Comments['id'], userId?: User['id']): Promise<CommentViewModel | null> {
    const query = `
      SELECT * FROM "comments" WHERE id = $1
    `

    const res = await this.dataSource.query(query, [commentsId])

    return res.length > 0 ? res.map((c: Comments) => this.mapPostCommentsOutput(c))[0] : null
  }

  protected mapPostCommentsOutput(
    comment: Comments,
    userId?: string | null | undefined,
  ) {
    try {
      const commentForOutput = {
        id: comment.id,
        content: comment.content,
        commentatorInfo: {
          userId: comment.userId,
          userLogin: comment.userLogin,
        },
        createdAt: comment.createdAt,
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: "None",
        },
      };
      return commentForOutput;
    } catch (error) {
      console.error('mapPostCommentsOutput', error);
      return null;
    }
  }
}