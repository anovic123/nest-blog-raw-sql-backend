import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

import { BaseEntity } from "@core/entities/base.entity";
import { BlogTypeorm } from "../../blogs/domain/blogs-typeorm.entity";

@Entity('posts')
export class PostsTypeorm extends BaseEntity {
  @Column({
    type: "varchar",
    nullable: false,
  })
  title: string;

  @Column({
    type: "varchar",
    nullable: false,
    length: 100,
  })
  shortDescription: string;

  @Column({
    type: "varchar",
    nullable: false,
    length: 1000,
  })
  content: string;

  @Column({
    type: "uuid",
    nullable: false,
  })
  
  blogId: string;
  
  @ManyToOne(() => BlogTypeorm, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blogId' })
  blog: BlogTypeorm;

  @Column({
    type: "varchar",
    nullable: false,
  })
  blogName: string;

  @Column({ type: "boolean", nullable: false, default: false })
  isMembership: boolean;
}
