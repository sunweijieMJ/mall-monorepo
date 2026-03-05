import { Global, Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionInterceptor } from './transaction.interceptor';

/**
 * 全局事务模块 — 注册后所有模块均可注入 TransactionService
 *
 * 使用场景：
 * - 替代直接注入 DataSource 进行事务操作
 * - 方便单元测试中 Mock 事务行为
 * - 统一事务日志（commit/rollback 均记录 debug 日志）
 * - 配合 @Transactional() 装饰器实现声明式事务
 */
@Global()
@Module({
  providers: [TransactionService, TransactionInterceptor],
  exports: [TransactionService, TransactionInterceptor],
})
export class TransactionModule {}
