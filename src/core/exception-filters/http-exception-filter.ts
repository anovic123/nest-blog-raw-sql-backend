import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorMessage {
  message: string;
  field: string;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    if (status === HttpStatus.BAD_REQUEST) {
      const errorsResponse: { errorsMessages: ErrorMessage[] } = {
        errorsMessages: [],
      };

      const responseBody: any = exception.getResponse();

      const extractErrors = (error: any): void => {
        if (Array.isArray(error.message)) {
          error.message.forEach((nestedError) => {
            extractErrors(nestedError);
          });
        } else {
          errorsResponse.errorsMessages.push({
            message:
              typeof error.message === 'string' ? error.message : String(error),
            field:
              typeof error.key === 'string'
                ? error.key
                : responseBody?.split(' ')[0],
          });
        }
      };

      extractErrors(responseBody);

      response.status(status).send(errorsResponse);
    } else {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}