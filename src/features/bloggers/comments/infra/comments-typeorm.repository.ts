import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { v4 as uuidv4 } from "uuid";

import { Comments } from "../domain/comments.entity";
import { User } from "src/features/users/domain/users.entity";
import { Posts } from "../../posts/domain/posts.entity";
import { LikeComment } from "../domain/like-comment.entity";

import { CommentViewModel, LikeCommentStatus } from "../api/models/output";

@Injectable()
export class CommentsTypeormRepository {
  constructor (
    @InjectRepository(Comments) protected readonly commentsRepository: Repository<Comments>,
    @InjectRepository(LikeComment) protected readonly likeCommentRepository: Repository<LikeComment>
  ) {}

  public async isCommentsExisted(id: Comments['id']): Promise<boolean> {
    const count = await this.commentsRepository.count({
      where: { id }
    })

    return count > 0
  }

  public async isCommentsOwn(id: Comments['id'], userId: User['id']): Promise<boolean> {
    const count = await this.commentsRepository.count({
      where: {
        id,
        userId
      }
    })

    return count > 0
  }

  public async deleteComment(id: Comments['id']): Promise<boolean> {
    const res = await this.commentsRepository.softDelete(id)

    return res.affected !== undefined && res.affected !== null && res.affected > 0;
  }
  
  public async updateComment(
    id: Comments['id'],
    content: Comments['content']
  ): Promise<boolean> {
    const res = await this.commentsRepository.update(
      {
        id
      },
      {
        content
      }
    )

    return res.affected !== undefined && res.affected !== null && res.affected > 0;
  }

  public async createPostComment (newComment: Comments): Promise<CommentViewModel> {
    const res = await this.commentsRepository.save(newComment)

    return this.mapPostCommentsOutput(newComment)
  }

  public async findLikeCommentById(userId: User['id'], commentId: Comments['id'], postId: Posts['id']) {
    const commentsRes = await this.likeCommentRepository.findOne({
      where: {
        authorId: userId,
        commentId,
        postId
      }
    })

    return commentsRes;
  }

  public async likeComments(userId: User['id'], postId: Posts['id'], commentId: Comments['id']): Promise<boolean> {
    try {
      return await this.updateLikeStatus(userId, postId, commentId, LikeCommentStatus.LIKE);
    } catch (error) {
      throw new HttpException('Failed to like comment', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  public async dislikeComments(userId: User['id'], postId: Posts['id'], commentId: Comments['id']): Promise<boolean> {
    try {
      return await this.updateLikeStatus(userId, postId, commentId, LikeCommentStatus.DISLIKE);
    } catch (error) {
      throw new HttpException('Failed to dislike comment', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  public async noneStatusComments(userId: User['id'], postId: Posts['id'], commentId: Comments['id']): Promise<boolean> {
    try {
      return await this.updateLikeStatus(userId, postId, commentId, LikeCommentStatus.NONE);
    } catch (error) {
      throw new HttpException('Failed to set comment status to none', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  private async updateLikeStatus(
    userId: User['id'],
    postId: Posts['id'],
    commentId: Comments['id'],
    status: LikeCommentStatus
  ): Promise<boolean> {
    const existingLike = await this.findLikeCommentById(userId, commentId, postId);
  
    if (existingLike) {
      existingLike.status = status;
      existingLike.createdAt = new Date();
      await this.likeCommentRepository.save(existingLike);
    } else {
      const newLike = this.likeCommentRepository.create({
        id: uuidv4(),
        authorId: userId,
        commentId,
        postId,
        status,
        createdAt: new Date(),
      });
      await this.likeCommentRepository.save(newLike);
    }
  
    return true;
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
}