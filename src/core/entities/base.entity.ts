import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  public createdAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}