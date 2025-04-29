import { IsEnum } from 'class-validator';
import { IsOptional, IsString } from '@nestjs/class-validator';

import { QueryPaginationInputModel } from 'src/base/models/query-pagination.input.model';

import { PublishedStatus } from '../enums/published-status';

export class PaginationQuestionInputModel extends QueryPaginationInputModel {
  @IsOptional()
  @IsString()
  bodySearchTerm: string = '';

  @IsEnum(PublishedStatus, {
    message: 'publishedStatus must be one of: all, published, unpublished',
  })
  publishedStatus: PublishedStatus = PublishedStatus.All;
}
