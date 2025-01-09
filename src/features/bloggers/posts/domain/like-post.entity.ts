import { Entity, Column, Unique } from 'typeorm';

import { LikePostStatus } from '../../blogs/api/models/output';

import { BaseEntity } from "../../../../core/entities/base.entity";
@Entity('like-posts')
@Unique(['authorId', 'postId', 'id'])
export class LikePosts extends BaseEntity {
  @Column({ type: 'varchar', nullable: false })
  authorId: string;

  @Column({ type: 'varchar', nullable: false })
  status: LikePostStatus;

  @Column({ type: 'varchar', nullable: false })
  postId: string;

  static createPostLike(body: {
    authorId: LikePosts['authorId'],
    status: LikePosts['status'],
    postId: LikePosts['postId']
  }) {
    const newLike = new LikePosts()

    const {
      authorId,
      postId,
      status
    } = body

    newLike.authorId = authorId
    newLike.postId = postId
    newLike.status = status

    return newLike
  }
}
