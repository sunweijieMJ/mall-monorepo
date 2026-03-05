import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../dto/api-response.dto';
import { SKIP_RESPONSE_TRANSFORM_KEY } from '../decorators/skip-response-transform.decorator';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T> | T
> {
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T> | T> {
    const skip = this.reflector.getAllAndOverride<boolean>(
      SKIP_RESPONSE_TRANSFORM_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (skip) return next.handle();

    return next.handle().pipe(
      map((data) => {
        if (this.isApiResponse(data)) return data;
        return { code: 200, message: 'success', data };
      }),
    );
  }

  private isApiResponse(data: unknown): data is ApiResponse<T> {
    if (typeof data !== 'object' || data === null) return false;
    const r = data as Record<string, unknown>;
    return (
      typeof r.code === 'number' && typeof r.message === 'string' && 'data' in r
    );
  }
}
