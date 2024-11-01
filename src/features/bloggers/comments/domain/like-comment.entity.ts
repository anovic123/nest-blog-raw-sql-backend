import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";

import { LikeCommentStatus } from "../api/models/output";

@Entity('like-comments')
export class LikeComment {
  @PrimaryColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    nullable: false
  })
  authorId: string;

  @Column({
    type: 'varchar',
    nullable: false
  })
  status: LikeCommentStatus

  @Column({
    type: 'varchar',
    nullable: false
  })
  postId: string;

  @Column({
    type: 'varchar',
    nullable: false
  })
  commentId: string;

  @CreateDateColumn()
  createdAt: Date;
}
