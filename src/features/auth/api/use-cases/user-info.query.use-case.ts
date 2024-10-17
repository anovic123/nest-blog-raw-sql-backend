import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus } from '@nestjs/common';

import { UsersRepository } from '../../../users/infra/users.repository';

export class GetUserInfoQuery {
  constructor(public readonly id: number) {}
}

@QueryHandler(GetUserInfoQuery)
export class GetUserInfoHandler implements IQueryHandler<GetUserInfoQuery> {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(query: GetUserInfoQuery): Promise<UserInfoOutputModel> {
    const { id } = query;

    const user = await this.usersRepository.findUserById(
      id,
    );

    if (!user) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const userOutput = {
      email: user.email,
      login: user.login,
      userId: user.id,
    };

    return userOutput;
  }
}