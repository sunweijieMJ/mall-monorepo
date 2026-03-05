import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { Observable, from, lastValueFrom } from 'rxjs';
import { TRANSACTIONAL_KEY } from './transactional.decorator';
import { TransactionService } from './transaction.service';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TransactionInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly dataSource: DataSource,
    private readonly transactionService: TransactionService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const isTransactional = this.reflector.get<boolean>(
      TRANSACTIONAL_KEY,
      context.getHandler(),
    );

    if (!isTransactional) {
      return next.handle();
    }

    return from(
      this.transactionService.run(async () => {
        return lastValueFrom(next.handle());
      }),
    );
  }
}
