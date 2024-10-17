import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';


@Injectable()
export class TestingRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  public async deleteAll(): Promise<boolean> {
    try {
      const userTable = `
        TRUNCATE TABLE "users" RESTART IDENTITY CASCADE
      `;

      await this.dataSource.query(userTable)
      
      return true
    } catch (error) {
      console.error(error)
      return false;
    }
  }
}