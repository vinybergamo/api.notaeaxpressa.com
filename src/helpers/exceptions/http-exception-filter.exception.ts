import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { isArray } from 'class-validator';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const errorResponse = exception.getResponse() as {
      error: string;
      message: string | string[];
    };

    response.status(status).json({
      error: isArray(errorResponse.message)
        ? errorResponse.error.toUpperCase().replace(/ /g, '_')
        : errorResponse.message,
      message: isArray(errorResponse.message)
        ? errorResponse.message
        : errorResponse.error,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      statusCode: status,
    });
  }
}
