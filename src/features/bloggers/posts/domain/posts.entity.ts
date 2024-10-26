import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";

@Entity('posts')
export class Posts {
  @PrimaryColumn('uuid')
  id: string;

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
    type: "varchar",
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
