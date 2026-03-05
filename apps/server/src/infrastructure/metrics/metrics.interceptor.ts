import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';
import { Request } from 'express';

/**
 * 请求指标拦截器 -- 记录每个请求的 QPS、延迟、状态码
 *
 * 指标：
 * - http_requests_total: Counter (method, path, status)
 * - http_request_duration_seconds: Histogram (method, path, status)
 */
@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(
    @InjectMetric('http_requests_total')
    private readonly requestCounter: Counter,
    @InjectMetric('http_request_duration_seconds')
    private readonly requestDuration: Histogram,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method;
    const path = this.normalizePath(request.route?.path || request.url);
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const status = context.switchToHttp().getResponse().statusCode;
          this.record(method, path, status, startTime);
        },
        error: (err) => {
          const status = err.status || 500;
          this.record(method, path, status, startTime);
        },
      }),
    );
  }

  private record(
    method: string,
    path: string,
    status: number,
    startTime: number,
  ): void {
    const duration = (Date.now() - startTime) / 1000;
    const labels = { method, path, status: String(status) };
    this.requestCounter.inc(labels);
    this.requestDuration.observe(labels, duration);
  }

  /**
   * 规范化路径：将动态 ID 替换为占位符，防止指标基数爆炸
   * /api/v1/pms/products/123 -> /api/v1/pms/products/:id
   */
  private normalizePath(path: string): string {
    return path
      .replace(/\/\d+/g, '/:id')
      .replace(
        /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
        '/:uuid',
      )
      .split('?')[0]; // Remove query string
  }
}
