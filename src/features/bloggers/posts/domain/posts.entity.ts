import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";

import { BaseEntity } from "@core/entities/base.entity";

@Entity('posts')
export class Posts extends BaseEntity {
  @Column({
    type: "varchar",
    nullable: false
  })
  title: string;

  @Column({
    type: "varchar",
    nullable: false,
    length: 100
  })
  shortDescription: string;

  @Column({
    type: "varchar",
    nullable: false,
    length: 1000
  })
  content: string;

  @Column({
    type: "uuid",
    nullable: false
  })
  blogId: string;

  @Column({
    type: "varchar",
    nullable: false
  })
  blogName: string;

  @CreateDateColumn()
  createdAt: Date;
  
  @Column({ type: "boolean", nullable: false, default: false })
  isMembership: boolean;
}
