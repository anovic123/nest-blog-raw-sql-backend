import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus } from '@nestjs/common';

import { UserInfoOutputModel } from '../../api/models/output/user-info.output.model';

import { UsersTypeormRepository } from 'src/features/users/infra/users-typeorm.repository';

export class GetUserInfoQuery {
  constructor(public readonly id: string) {}
}

@QueryHandler(GetUserInfoQuery)
export class GetUserInfoHandler implements IQueryHandler<GetUserInfoQuery> {
  constructor(private readonly usersRepository: UsersTypeormRepository) {}

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