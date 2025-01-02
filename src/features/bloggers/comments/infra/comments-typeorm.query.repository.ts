import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Comments } from "../domain/comments.entity";
import { Posts } from "../../posts/domain/posts.entity";
import { LikeComment } from "../domain/like-comment.entity";
import { User } from "src/features/users/domain/users.entity";

import { PaginationType } from "src/base/models/pagination.base.model";

import { PaginatedResponse } from "src/base/types/pagination";

import { CommentViewModel, LikeCommentStatus } from "../api/models/output";

@Injectable()
export class CommentsTypeormQueryRepository {
  constructor (
    @InjectRepository(Comments) 
    protected readonly commentsRepository: Repository<Comments>,
    @InjectRepository(LikeComment)
    protected readonly likeCommentsRepository: Repository<LikeComment>
  ) {}

  public async getPostsComments(
    postId: Posts['id'],
    pagination: PaginationType,
    userId?: string
  ): Promise<PaginatedResponse<CommentViewModel>> {
    const {
      pageNumber,
      pageSize,
      sortBy,
      sortDirection
    } = pagination;

    const queryBuilder = this.commentsRepository.createQueryBuilder('c')

    queryBuilder.select([
      'c.id',
      'c.content',
      'c.userId',
      'c.userLogin',
      'c.createdAt',
      'c.postId'
    ])

    queryBuilder.where({
      postId
    })

    queryBuilder.orderBy(`c.${sortBy}`, sortDirection?.toUpperCase() as 'ASC' | 'DESC');

    queryBuilder.skip((pageNumber - 1) * pageSize).take(pageSize)

    const [ comments, totalCount ] = await queryBuilder.getManyAndCount()

    const paginationResult = {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize,
      totalCount,
      items: comments.length > 0 ? await Promise.all(comments.map((p: Comments) => this.mapPostCommentsOutput(p, false, userId))) : []
    };

    return paginationResult;
  }

  public async getPostsCommentsById(
    commentsId: Comments['id'],
    userId?: User['id'],
    includePostId: boolean = false
  ) {
    const res = await this.commentsRepository.findOne({ where: {
      id: commentsId
    }})

    return res ? await this.mapPostCommentsOutput(res, includePostId, userId) : null;
  }

  protected async mapPostCommentsOutput(
    comment: Comments,
    includePostId: boolean = false,
    userId?: string | null
  ): Promise<CommentViewModel> {
    const likesRes = await this.likeCommentsRepository.createQueryBuilder('l')
    .select([
      "l.*",
      `(SELECT "users"."login" FROM "users" WHERE "users"."id" = l."authorId") AS "login"`
    ])
    .where("l.commentId = :commentId", { commentId: comment?.id })
    .orderBy("l.createdAt", "DESC")
    .getRawMany();
        
    const userLike = userId ? likesRes?.find((l: LikeComment) => l.authorId === userId) : null;
    const likesCount = likesRes?.filter((l: LikeComment) => l.status === LikeCommentStatus.LIKE).length ?? 0;
    const dislikesCount = likesRes?.filter((l: LikeComment) => l.status === LikeCommentStatus.DISLIKE).length ?? 0;
    const myStatus = userLike?.status ?? LikeCommentStatus.NONE;

    const commentForOutput: CommentViewModel = {
      id: comment?.id,
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
      commentForOutput.postId = comment?.postId;
    }
  
    return commentForOutput;
  }
}