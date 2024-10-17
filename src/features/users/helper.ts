import { IsEnum, IsNumber, IsString } from 'class-validator';

enum UserSortBy {
  createdAt = 'createdAt',
  name = 'name',
}

enum UserSortDirection {
  asc = 'asc',
  desc = 'desc',
}

export abstract class UsersQuery {
  @IsNumber()
  pageNumber: number = 1;

  @IsNumber()
  pageSize: number = 10;

  @IsEnum(UserSortBy)
  sortBy: UserSortBy;

  @IsEnum(UserSortDirection)
  sortDirection: UserSortDirection;

  @IsString()
  searchLoginTerm: string;

  @IsString()
  searchEmailTerm: string;
}

export class UsersQueryParams extends UsersQuery {}

export const getUsersHelper = (query: {
  [key: string]: string | undefined;
}) => {
  return {
    pageNumber: query.pageNumber ? +query.pageNumber : 1,
    pageSize: query.pageSize !== undefined ? +query.pageSize : 10,
    sortBy: query.sortBy ? query.sortBy : 'createdAt',
    sortDirection:
      query.sortDirection !== undefined ? query.sortDirection : 'desc',
    searchLoginTerm:
      query.searchLoginTerm !== undefined ? query.searchLoginTerm : null,
    searchEmailTerm:
      query.searchEmailTerm !== undefined ? query.searchEmailTerm : null,
  };
};