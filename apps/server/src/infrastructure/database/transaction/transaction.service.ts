import { Injectable, Logger } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

/**
 * 事务服务 — 将 dataSource.transaction() 封装为可注入、可 Mock 的服务
 *
 * 用法：
 * ```typescript
 * const result = await this.transactionService.run(async (manager) => {
 *   const a = await manager.save(EntityA, data);
 *   await manager.save(EntityB, { aId: a.id });
 *   return a;
 * });
 * ```
 */
@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * 在事务中执行回调：成功则 commit，抛错则 rollback 并重抛
   */
  async run<T>(callback: (manager: EntityManager) => Promise<T>): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    this.logger.debug('事务已开始');

    try {
      const result = await callback(queryRunner.manager);
      await queryRunner.commitTransaction();
      this.logger.debug('事务已提交');
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.warn('事务已回滚', {
        error: error instanceof Error ? error.message : '未知错误',
      });
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
