import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

import { Posts } from "../../posts/domain/posts.entity";

import { PaginationType } from "src/base/models/pagination.base.model";

import { PaginatedResponse } from "src/base/types/pagination";
import { BlogViewModel } from "../../blogs/api/models/output";
import { Comments } from "../domain/comments.entity";
import { CommentViewModel, LikeCommentStatus } from "../api/models/output";
import { User } from "src/features/users/domain/users.entity";
import { LikeComment } from "../domain/like-comment.entity";



@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource
  ) {}

  public async getPostsComments(
    postId: Posts['id'],
    pagination: PaginationType,
    userId?: string
  ): Promise<PaginatedResponse<BlogViewModel>> {
    const {
      pageNumber,
      pageSize,
      sortBy,
      sortDirection
    } = pagination;
  
    const query = `
      SELECT * FROM "comments" WHERE "postId" = $1
      ORDER BY "${sortBy}" ${sortDirection.toUpperCase()}
      LIMIT ${pageSize} OFFSET ${(pageNumber - 1) * pageSize}
    `;
  
    const commentsRes = await this.dataSource.query(query, [postId]);
  
    const totalCountQuery = `
      SELECT COUNT(*) FROM "comments" WHERE "postId" = $1
    `;
  
    const totalCountRes = await this.dataSource.query(totalCountQuery, [postId]);
    const totalCount = parseInt(totalCountRes[0].count, 10);
  
    const paginationResult = {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize,
      totalCount,
      items: commentsRes.length > 0 ? await Promise.all(commentsRes.map((p: Comments) => this.mapPostCommentsOutput(p, false, userId))) : []
    };
    
    return paginationResult;
  }  

  public async getPostsCommentsById(
    commentsId: Comments['id'],
    userId?: User['id'],
    includePostId: boolean = false
  ): Promise<CommentViewModel | null> {
    const query = `
      SELECT * FROM "comments" WHERE id = $1
    `;
  
    const res = await this.dataSource.query(query, [commentsId]);
  
    return res.length > 0
      ? await this.mapPostCommentsOutput(res[0], includePostId, userId)
      : null;
  }
  
  protected async mapPostCommentsOutput(
    comment: Comments,
    includePostId: boolean = false,
    userId?: string | null,
  ): Promise<CommentViewModel> {
    const likes = await this.dataSource.query(
      `
        SELECT lp.*, (
          SELECT "login" 
          FROM "users" 
          WHERE "users"."id" = lp."authorId"
        ) AS "login"
        FROM "like-comments" AS lp 
        WHERE lp."commentId" = $1
        ORDER BY lp."createdAt" DESC
      `,
      [comment.id]
    );
  
    const userLike = userId ? likes.find((l: LikeComment) => l.authorId === userId) : null;
    const likesCount = likes.filter((l: LikeComment) => l.status === LikeCommentStatus.LIKE).length;
    const dislikesCount = likes.filter((l: LikeComment) => l.status === LikeCommentStatus.DISLIKE).length;
    const myStatus = userLike?.status ?? LikeCommentStatus.NONE;
  
    const commentForOutput: CommentViewModel = {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId,
        userLogin: comment.userLogin,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount,
        dislikesCount,
        myStatus,
      },
    };
  
    if (includePostId) {
      commentForOutput.postId = comment.postId;
    }
  
    return commentForOutput;
  }  
}