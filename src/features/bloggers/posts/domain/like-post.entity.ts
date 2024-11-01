import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";
import { LikePostStatus } from "../../blogs/api/models/output";

@Entity('like-posts')
export class LikePosts {
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
  status: LikePostStatus

  @Column({
    type: 'varchar',
    nullable: false
  })
  postId: string;

  @CreateDateColumn()
  createdAt: Date;
}