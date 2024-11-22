import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBasicAuth, ApiExtraModels, ApiQuery, ApiResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';

import { BasicAuthGuard } from '../../../core/guards/auth-basic.guards';

import { UserOutputModel } from '../../auth/api/models/output/user.output.model';
import { UserCreateModel } from './models/input/create-user.input.model';
import { PaginationOutput, PaginationQueryDto, PaginationWithSearchLoginAndEmailTerm } from '../../../base/models/pagination.base.model';

import { UsersQueryRepository } from '../infra/users-query.repository';

import { CreateUserCommand } from '../../auth/application/use-cases/create-users.use-case';

import { SortingPropertiesType } from '../../../base/types/sorting-properties.type';
import { DeleteUserCommand } from '../application/use-cases/delete-users.use-case';

export const USERS_SORTING_PROPERTIES: SortingPropertiesType<UserOutputModel> =
  ['login', 'email'];

@ApiTags('Users')
@ApiBasicAuth()
@Controller('sa/users')
@UseGuards(BasicAuthGuard)
export class UsersController {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly commandBus: CommandBus
  ) {}

  @ApiExtraModels(PaginationOutput, UserOutputModel)
  @Get()
  @ApiQuery({ name: 'Pagination Query', type: PaginationQueryDto  })
  @ApiResponse({
    status: 200,
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginationOutput) },
        {
          properties: {
            items: {
              type: 'array',
              items: { $ref: getSchemaPath(UserOutputModel) },
            },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public async getUsers(@Query() query) {
    const pagination: PaginationWithSearchLoginAndEmailTerm =
      new PaginationWithSearchLoginAndEmailTerm(
        query,
        USERS_SORTING_PROPERTIES
      )

    return this.usersQueryRepository.getAllUsers(pagination)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201, description: 'Created', type: UserOutputModel })
  @ApiResponse({ status: 400, description: 'Validations errors' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public async registerUser(@Body() createModel: UserCreateModel) {
    return this.commandBus.execute(new CreateUserCommand(createModel));
  }

  @Delete('/:id')
  @ApiResponse({ status: 204, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteUser(@Param('id') id: string) {
    return this.commandBus.execute(new DeleteUserCommand(id));
  }
}