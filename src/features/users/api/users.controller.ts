import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { BasicAuthGuard } from '../../../core/guards/auth-basic.guards';

import { UserOutputModel } from '../../auth/api/models/output/user.output.model';
import { UserCreateModel } from './models/input/create-user.input.model';
import { PaginationWithSearchLoginAndEmailTerm } from '../../../base/models/pagination.base.model';

import { UsersQueryRepository } from '../infra/users-query.repository';

import { CreateUserCommand } from '../../auth/application/use-cases/create-users.use-case';

import { SortingPropertiesType } from '../../../base/types/sorting-properties.type';
import { DeleteUserCommand } from '../application/use-cases/delete-users.use-case';

export const USERS_SORTING_PROPERTIES: SortingPropertiesType<UserOutputModel> =
  ['login', 'email'];

@UseGuards(BasicAuthGuard)
@Controller('sa/users')
export class UsersController {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly commandBus: CommandBus
  ) {}

  @Get()
  public async getUsers(@Query() query) {
    const pagination: PaginationWithSearchLoginAndEmailTerm =
      new PaginationWithSearchLoginAndEmailTerm(
        query,
        USERS_SORTING_PROPERTIES
      )

    return this.usersQueryRepository.getAllUsers(pagination)
  }

  @Post()
  public async registerUser(@Body() createModel: UserCreateModel) {
    return this.commandBus.execute(new CreateUserCommand(createModel));
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteUser(@Param('id') id: string) {
    return this.commandBus.execute(new DeleteUserCommand(id));
  }
}