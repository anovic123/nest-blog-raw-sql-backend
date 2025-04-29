import { InterlayerNotice, InterlayerNoticeExtension } from './interlayer';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';

export class ErrorProcessor<D = null> {
  public extensions: InterlayerNoticeExtension[];
  public code: number;

  private static readonly errorMapping = {
    400: BadRequestException,
    401: UnauthorizedException,
    403: ForbiddenException,
    404: NotFoundException,
  };

  constructor(result: InterlayerNotice<D>) {
    this.code = result.code;
    this.extensions = result.extensions;
  }

  public handleError(): void {
    const ErrorClass = ErrorProcessor.errorMapping[this.code] || InternalServerErrorException;

    if (this.extensions.length) {
      const message = this.extensions.map(ext => ext.message).join(', ');
      throw new ErrorClass(message);
    } else {
      throw new ErrorClass('An unknown error occurred');
    }
  }
}
