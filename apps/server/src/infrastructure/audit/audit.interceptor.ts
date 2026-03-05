import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Request } from 'express';
import { AuditLogEntity } from './entities/audit-log.entity';
import {
  AUDIT_METADATA_KEY,
  AuditOptions,
} from './decorators/auditable.decorator';

// Fields to redact from request body
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'authCode',
  'refreshToken',
];

function redactSensitiveData(body: any): string {
  if (!body || typeof body !== 'object') return JSON.stringify(body);
  const sanitized = { ...body };
  for (const field of SENSITIVE_FIELDS) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }
  return JSON.stringify(sanitized);
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(AuditLogEntity)
    private readonly auditLogRepo: Repository<AuditLogEntity>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditOptions = this.reflector.get<AuditOptions>(
      AUDIT_METADATA_KEY,
      context.getHandler(),
    );

    // If no @Auditable decorator, skip
    if (!auditOptions) return next.handle();

    const request = context.switchToHttp().getRequest<Request>();
    const startTime = Date.now();
    const user = (request as any).user;

    const logEntry: Partial<AuditLogEntity> = {
      userId: user?.sub ?? 0,
      userType: user?.type ?? 'unknown',
      username: user?.username ?? 'anonymous',
      action: auditOptions.action,
      entityType: auditOptions.entityType,
      method: request.method,
      path: request.url,
      requestBody: redactSensitiveData(request.body),
      ip:
        (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        request.ip ||
        '',
      userAgent: (request.headers['user-agent'] as string)?.substring(0, 500),
    };

    return next.handle().pipe(
      tap(() => {
        logEntry.statusCode = context.switchToHttp().getResponse().statusCode;
        logEntry.duration = Date.now() - startTime;
        this.saveLog(logEntry);
      }),
      catchError((err) => {
        logEntry.statusCode = err.status || 500;
        logEntry.duration = Date.now() - startTime;
        this.saveLog(logEntry);
        return throwError(() => err);
      }),
    );
  }

  private saveLog(entry: Partial<AuditLogEntity>): void {
    this.auditLogRepo.save(entry).catch((err) => {
      this.logger.error('审计日志保存失败', err.message);
    });
  }
}
