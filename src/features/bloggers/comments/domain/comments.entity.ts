import { Column, Entity } from "typeorm";

import { BaseEntity } from "../../../../core/entities/base.entity";

@Entity('comments')
export class Comments  extends BaseEntity {
  // @PrimaryColumn('varchar')
  // id: string;

  @Column({
    type: "varchar",
    nullable: false,
    length: 300
  })
  content: string;

  @Column({
    type: 'uuid',
    nullable: true
  })
  userId: string;

  @Column({
    type: "varchar",
    nullable: false
  })
  userLogin: string;

  // @CreateDateColumn()
  // createdAt: Date;

  @Column({
    type: 'uuid',
    nullable: true
  })
  postId: string;
}
