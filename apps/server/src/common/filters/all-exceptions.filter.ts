import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ThrottlerException } from '@nestjs/throttler';
import { Request } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const path = httpAdapter.getRequestUrl(request);
    const requestId = request.headers['x-request-id'] as string | undefined;

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = '服务器内部错误';
    let errors: Record<string, unknown> | null = null;

    if (exception instanceof ThrottlerException) {
      statusCode = HttpStatus.TOO_MANY_REQUESTS;
      message = '请求过于频繁，请稍后再试';
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const response = exception.getResponse();
      if (typeof response === 'string') {
        message = response;
      } else if (typeof response === 'object' && response !== null) {
        const r = response as Record<string, unknown>;
        message = (r.message as string | string[]) ?? message;
        errors = (r.errors as Record<string, unknown>) ?? null;
      }
    } else if (exception instanceof Error) {
      this.logger.error(`未处理异常: ${exception.message}`, exception.stack, {
        path,
        requestId,
      });
    } else {
      this.logger.error('未知异常类型', { exception, path, requestId });
    }

    // 按状态码分级记录日志（5xx error，4xx warn，其余 info）
    if (statusCode >= 500) {
      this.logger.error(`${statusCode} ${path}`, { message, requestId });
    } else if (
      statusCode >= 400 &&
      !(exception instanceof ThrottlerException)
    ) {
      this.logger.warn(`${statusCode} ${path}`, { message, requestId });
    }

    httpAdapter.reply(
      ctx.getResponse(),
      { code: statusCode, message, data: errors },
      statusCode,
    );
  }
}
