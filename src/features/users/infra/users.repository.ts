import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { add } from 'date-fns';

import { User } from '../domain/users.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectDataSource()
    protected datasource: DataSource
  ) {}

  public async emailIsExist(email: string): Promise<boolean> {
    const query = `
      SELECT Count(*) FROM "users" WHERE email = $1
    `

    const res = await this.datasource.query(query, [email])

    return parseInt(res[0].count, 10) > 0
  }

  public async loginIsExist(login: string): Promise<boolean> {
    const query = `
      SELECT Count(*) FROM "users" WHERE login = $1
    `

    const res = await this.datasource.query(query, [login])

    return parseInt(res[0].count, 10) > 0
  }

  public async deleteUser(id: string): Promise<boolean> {
    const query = `
      DELETE FROM "users" WHERE id = $1
    `

    const res = await this.datasource.query(query, [id])

    return !!res[1]
  }

  public async updateUserPasswordHash(
    id: string,
    newPasswordHash: string
  ): Promise<boolean> {
    const query = `
    UPDATE "users" SET "passwordHash" = $1 WHERE id = $2`

    const res = await this.datasource.query(query, [newPasswordHash, id])
    return !!res[1]
  }

  public async updateConfirmation(id: User['id']): Promise<boolean> {
    const query = `
    UPDATE "users" 
    SET "isConfirmed" = true 
    WHERE "id" = $1
  `;

    const result = await this.datasource.query(query, [id]);
    console.log(result)
    return result[1] === 1;
  }


  public async updateUserConfirmationCode(
    id: string,
    newCode: string
  ): Promise<boolean> {
    const expirationDate = add(
      new Date(),
      {
        hours: 1,
        minutes: 3
      }
    )

    const query = `
      UPDATE "users"
      SET "confirmationCode" = $1,
      "expirationDate" = $2
      WHERE "id" = $3
    `

    const result = await this.datasource.query(
      query,
      [
        newCode,
        expirationDate,
        id
      ]
    )

    return result[1] === 1;
  }

  public async findUserById(id: User['id']): Promise<User | null> {
    const query = `
    SELECT * FROM "users" WHERE id = $1`

    const res = await this.datasource.query(query, [id])

    return res.length ? res[0] : null
  }
}