import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { User } from 'src/features/users/domain/users.entity';

import { UserOutputModel } from "src/features/auth/api/models/output/user.output.model";

@Injectable()
export class AuthSqlRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource
  ) {
  }

  public async createUser(user: Omit<User, 'isConfirmed'>): Promise<UserOutputModel> {
    const query = `
      INSERT INTO "users"
      (id, email, "passwordHash", "expirationDate", "createdAt", login, "confirmationCode")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `;

    const result = await this.dataSource.query(
      query,
      [
        user.id,
        user.email,
        user.passwordHash,
        user.expirationDate,
        user.createdAt,
        user.login,
        user.confirmationCode
      ]
    );

    return this.outputModelUser({
      ...user,
      id: result[0].id,
      isConfirmed: false
    })
  }

  public outputModelUser(user: User): UserOutputModel {
    return {
      id: user.id,
      createdAt: user.createdAt,
      email: user.email,
      login: user.login
    }
  }
}
