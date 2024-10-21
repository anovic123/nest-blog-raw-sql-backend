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

    const emailQuery = searchEmailTerm ? `"email" ILIKE '%${searchEmailTerm}%'` : null
    const loginQuery = searchLoginTerm ? `"login" ILIKE '%${searchLoginTerm}%'` : null
    const filters = [
      emailQuery,
      loginQuery
    ].filter(Boolean).join(" OR ")

    const query = `
      SELECT * FROM "users" 
      ${filters ? `WHERE ${filters}`: ""}
      ORDER BY "${sortBy}" ${sortDirection.toUpperCase()}
      LIMIT ${pageSize} OFFSET ${(pageNumber - 1) * pageSize}
    `;

    const usersResult = await this.dataSource.query(query);

    const totalCountQuery = `
      SELECT COUNT(*) FROM "users" ${filters ? `WHERE ${filters}` : ""}
    `;
    const totalCountRes = await this.dataSource.query(totalCountQuery);
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
