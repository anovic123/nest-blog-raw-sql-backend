import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";

@Entity('comments')
export class Comments {
  @PrimaryColumn('varchar')
  id: string;

  @Column({
    type: "varchar",
    nullable: false,
    length: 300
  })
  content: string;

  @Column({
    type: 'varchar',
    nullable: false
  })
  userId: string;

  @Column({
    type: "varchar",
    nullable: false
  })
  userLogin: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({
    type: 'varchar',
    nullable: false
  })
  postId: string;
}
