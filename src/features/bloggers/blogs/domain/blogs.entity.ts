import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";

@Entity('blogs')
export class Blog {
  @PrimaryColumn('varchar')
  id: string;

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