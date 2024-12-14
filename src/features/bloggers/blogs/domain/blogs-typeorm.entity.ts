import { Column, CreateDateColumn, Entity } from "typeorm";

import { BaseEntity } from "@core/entities/base.entity";

@Entity('blogs')
export class BlogTypeorm extends BaseEntity {
  @Column({ type: "varchar", nullable: false })
  name: string;

  @Column({ type: "varchar", nullable: false })
  description: string;

  @Column({ type: "varchar", nullable: false })
  websiteUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: "boolean", nullable: false, default: false })
  isMembership: boolean;
}