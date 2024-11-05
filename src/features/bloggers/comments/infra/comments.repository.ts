import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { v4 as uuidv4 } from "uuid";

import { Comments } from "../domain/comments.entity";

import { CommentViewModel, LikeCommentStatus } from "../api/models/output";

import { User } from "src/features/users/domain/users.entity";
import { Posts } from "../../posts/domain/posts.entity";

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource
  ) {}

  public async isCommentsExisted(id: Comments['id']): Promise<boolean> {
    const query = `
      SELECT COUNT(*) FROM "comments" WHERE id = $1
    `

    const res = await this.dataSource.query(query, [id])

    return parseInt(res[0].count, 10) > 0
  }

  public async isCommentsOwn(id: Comments['id'], userId: User['id']): Promise<boolean> {
    const query = `
    SELECT COUNT(*) FROM "comments" WHERE id = $1 AND "userId" = $2
    `

    const res = await this.dataSource.query(query, [id, userId])
    
    return parseInt(res[0].count, 10) > 0
  }

  public async deleteComment(id: Comments['id']): Promise<boolean> {
    const query = `
      DELETE FROM "comments" WHERE id = $1
    `

    const res = await this.dataSource.query(query, [id])

    return !!res[1]
  }

  public async updateComment(id: Comments['id'], content: Comments['content']): Promise<boolean> {
    const query = `
      UPDATE "comments" SET content = $1 WHERE id = $2
    `

    const result = await this.dataSource.query(
      query,
      [
        content,
        id
      ]
    )

    return result[1] === 1
  }

  public async createPostComment(newComment: Comments): Promise<CommentViewModel> {
    const {
      id,
      content,
      createdAt,
      postId,
      userId,
      userLogin
    } = newComment;

    const query = `
     INSERT INTO "comments" (
     id, "content", "createdAt", "postId", "userId", "userLogin"
     ) VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id
    `

    const result = await this.dataSource.query(query, [
      id,
      content,
      createdAt,
      postId,
      userId,
      userLogin
    ])

    return this.mapPostCommentsOutput(newComment)
 }

  public mapPostCommentsOutput(comment: Comments): CommentViewModel {
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
        myStatus: LikeCommentStatus.NONE,
      },
    };
    return commentForOutput;
  }

  public async likeComments(userId: User['id'], postId: Posts['id'], commentId: Comments['id']) {
    const id = uuidv4();
    await this.dataSource.query(
      `
      INSERT INTO "like-comments" ("id", "authorId", status, "postId", "commentId", "createdAt")
      VALUES ($1, $2, '${LikeCommentStatus.LIKE}', $3, $4, $5)
      ON CONFLICT ("authorId", "commentId")
      DO UPDATE SET status = '${LikeCommentStatus.LIKE}', "createdAt" = $5
      `,
      [id, userId, postId, commentId, new Date()]
    );
    return true;
  }
  
  public async dislikeComments(userId: User['id'], postId: Posts['id'], commentId: Comments['id']) {
    const id = uuidv4();
    await this.dataSource.query(
      `
      INSERT INTO "like-comments" ("id", "authorId", status, "postId", "commentId", "createdAt")
      VALUES ($1, $2, '${LikeCommentStatus.DISLIKE}', $3, $4, $5)
      ON CONFLICT ("authorId", "commentId")
      DO UPDATE SET status = '${LikeCommentStatus.DISLIKE}', "createdAt" = $5
      `,
      [id, userId, postId, commentId, new Date()]
    );
    return true;
  }
  
  public async noneStatusComments(userId: User['id'], postId: Posts['id'], commentId: Comments['id']) {
    const id = uuidv4();
    await this.dataSource.query(
      `
      INSERT INTO "like-comments" ("id", "authorId", status, "postId", "commentId", "createdAt")
      VALUES ($1, $2, '${LikeCommentStatus.NONE}', $3, $4, $5)
      ON CONFLICT ("authorId", "commentId")
      DO UPDATE SET status = '${LikeCommentStatus.NONE}', "createdAt" = $5
      `,
      [id, userId, postId, commentId, new Date()]
    );
    return true;
  }
  
}