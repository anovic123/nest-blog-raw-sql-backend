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
      const tables = await this.dataSource.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        `);

    for (const { table_name } of tables) {
      await this.dataSource.query(
        `TRUNCATE TABLE public."${table_name}" CASCADE`,
      );
    }

      return true
    } catch (error) {
      console.error(error)
      return false;
    }
  }
}