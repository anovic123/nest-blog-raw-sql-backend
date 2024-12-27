import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { ParsedQs } from 'qs';

export class PaginationOutput<D> {
  @ApiProperty({ description: 'Total number of pages', example: 10 })
  public readonly pagesCount?: number;

  @ApiProperty({ description: 'Current page number', example: 1 })
  public readonly page?: number;

  @ApiProperty({ description: 'Number of items per page', example: 10 })
  public readonly pageSize?: number;

  @ApiProperty({ description: 'Total number of items', example: 10 })
  public readonly totalCount?: number;

  @ApiProperty({ isArray: true, description: 'List of items', type: Object })
  public readonly items: D[];

  constructor(items: D[], page: number, pageSize: number, totalCount: number) {
    this.items = items;
    this.page = page;
    this.pageSize = pageSize;
    this.totalCount = totalCount;

    this.pagesCount = Math.ceil(totalCount / pageSize);
  }
}

export class Pagination {
  @ApiProperty({ description: 'Current page number', example: 1 })
  public readonly pageNumber: number;
  @ApiProperty({ description: 'Number of items per page', example: 10 })
  public readonly pageSize: number;
  @ApiProperty({ description: 'Sorting direction (asc or desc)', example: 'desc' })
  public readonly sortDirection: SortDirectionType;
  @ApiProperty({ description: 'Field to sort by', example: 'createdAt' })
  public readonly sortBy: string;
  @ApiProperty({ description: 'Search term for name', example: 'john', nullable: true })
  public readonly searchNameTerm: string | null;

  constructor(query: ParsedQs, sortProperties: string[]) {
    this.sortBy = this.getSortBy(query, sortProperties);
    this.sortDirection = this.getSortDirection(query);
    this.pageNumber = Number(query.pageNumber ?? 1);
    this.pageSize = Number(query.pageSize ?? 10);
    this.searchNameTerm = query.searchNameTerm?.toString() || null;
  }

  public getSortDirectionInNumericFormat(): -1 | 1 {
    return this.sortDirection === 'desc' ? -1 : 1;
  }

  public getSkipItemsCount() {
    return (this.pageNumber - 1) * this.pageSize;
  }

  private getSortDirection(query: ParsedQs): SortDirectionType {
    let sortDirection: SortDirectionType = 'desc';

    switch (query.sortDirection) {
      case 'desc': {
        sortDirection = 'desc';
        break;
      }
      case 'asc': {
        sortDirection = 'asc';
        break;
      }
    }
    return sortDirection;
  }

  private getSortBy(query: ParsedQs, sortProperties: string[]): string {
    let result = 'createdAt';

    const querySortBy = query.sortBy;

    if (querySortBy === undefined) {
      return result;
    }

    if (Array.isArray(querySortBy)) {
      for (let i: number = 0; i < querySortBy.length; i++) {
        const param = querySortBy[i];

        if (sortProperties.includes(param.toString())) {
          result = param.toString();
          break;
        }
      }
    } else {
      if (sortProperties.includes(querySortBy.toString())) {
        result = querySortBy.toString();
      }
    }

    return result;
  }
}

export class PaginationWithSearchLoginAndEmailTerm extends Pagination {
  @ApiProperty({ description: 'Search term for login', example: 'john_doe', nullable: true })
  public readonly searchLoginTerm: string | null;
  @ApiProperty({ description: 'Search term for email', example: 'john.doe@example.com', nullable: true })
  public readonly searchEmailTerm: string | null;

  constructor(query: ParsedQs, sortProperties: string[]) {
    super(query, sortProperties);

    this.searchLoginTerm = query.searchLoginTerm?.toString() || null;
    this.searchEmailTerm = query.searchEmailTerm?.toString() || null;
  }
}

export type SortDirectionType = 'desc' | 'asc';

export type PaginationType = {
  searchNameTerm: string | null;
  sortBy: string;
  sortDirection: SortDirectionType;
  pageNumber: number;
  pageSize: number;
};

export class PaginationQueryDto {
  @ApiProperty({
    description: 'Current page number',
    example: 1,
    required: false,
    type: Number,
  })
  @IsOptional()
  pageNumber?: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    required: false,
    type: Number,
  })
  @IsOptional()
  pageSize?: number;

  @ApiProperty({
    description: 'Sorting direction (asc or desc)',
    example: 'desc',
    required: false,
    type: String,
  })
  @IsOptional()
  sortDirection?: 'desc' | 'asc';

  @ApiProperty({
    description: 'Field to sort by',
    example: 'createdAt',
    required: false,
    type: String,
  })
  @IsOptional()
  sortBy?: string;

  @ApiProperty({
    description: 'Search term for name',
    example: 'john',
    required: false,
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  searchNameTerm?: string | null;

}

export class PaginationUsersQueryDto extends PaginationQueryDto {
  @ApiProperty({
    description: 'Search term for login',
    example: '',
    required: false,
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  searchLoginTerm?: string | null;

  @ApiProperty({
    description: 'Search term for email',
    example: '',
    required: false,
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  searchEmailTerm?: string | null;
}