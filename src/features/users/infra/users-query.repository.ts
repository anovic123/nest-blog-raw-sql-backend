import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PaginationOutput, PaginationWithSearchLoginAndEmailTerm } from '../../../base/models/pagination.base.model';
import { UserOutputModel } from '../../auth/api/models/output/user.output.model';
import { User } from '../domain/users.entity';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource
  ) {}

  public async getAllUsers(
    pagination: PaginationWithSearchLoginAndEmailTerm
  ): Promise<PaginationOutput<UserOutputModel>> {
    const {
      pageNumber,
      pageSize,
      searchEmailTerm,
      searchLoginTerm,
      sortBy,
      sortDirection,
    } = pagination;
    console.log(pagination)

    const whereConditions: string[] = [];
    const params: Array<string | number> = [pageSize, (pageNumber - 1) * pageSize];

    if (searchEmailTerm) {
      whereConditions.push(`"email" ILIKE $${params.length + 1}`);
      params.push(`%${searchEmailTerm}%`);
    }

    if (searchLoginTerm) {
      whereConditions.push(`"login" ILIKE $${params.length + 1}`);
      params.push(`%${searchLoginTerm}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" OR ")}` : "";

    const query = `
      SELECT * FROM "users" 
      ${whereClause}
      ORDER BY "${sortBy}" ${sortDirection.toUpperCase()}
      LIMIT $1 OFFSET $2
    `;

    const usersResult = await this.dataSource.query(query, params);

    const totalCountQuery = `
      SELECT COUNT(*) FROM "users" ${whereClause}
    `;
    const totalCountRes = await this.dataSource.query(totalCountQuery, params.slice(2));
    const totalCount = parseInt(totalCountRes[0].count, 10);

    const paginationResult = {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize,
      totalCount,
      items: usersResult.map(this.userOutput)
    };

    return paginationResult;
  }

  public async findUserByLoginOrEmail(loginOrEmail): Promise<User | null> {
    const query = `
      SELECT * FROM "users"
      WHERE login = $1 OR email = $1
    `

    const res = await this.dataSource.query(query, [loginOrEmail])
    return res.length ? res[0] : null;
  }

  public async findUserByConfirmationCode(code: string): Promise<User | null> {
    const query = `
    SELECT * FROM "users"
    WHERE "confirmationCode" = $1`

    const res = await this.dataSource.query(query, [code])
    return res.length ? res[0] : null;
  }

  public userOutput(user: User): UserOutputModel {
    return {
      id: user.id,
      login: user.login,
      email: user.email,
      createdAt: user.createdAt
    };
  }
}
