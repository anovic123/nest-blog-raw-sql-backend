import { Column, CreateDateColumn, Entity, PrimaryColumn, Unique } from "typeorm";

import { LikeCommentStatus } from "../api/models/output";

@Entity('like-comments')
@Unique(['authorId', 'postId'])
export class LikeComment {
  @PrimaryColumn('uuid')
  id: string;

  @Column({
    type: 'uuid',
    nullable: false
  })
  authorId: string;

  @Column({
    type: 'varchar',
    nullable: false
  })
  status: LikeCommentStatus

  @Column({
    type: 'uuid',
    nullable: false
  })
  postId: string;

  @Column({
    type: 'uuid',
    nullable: false
  })
  commentId: string;

  @CreateDateColumn()
  createdAt: Date;
}
