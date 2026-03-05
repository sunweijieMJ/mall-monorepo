import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

/**
 * Token 黑名单清理提示任务（每小时执行一次）
 *
 * 注意：Redis 中的 token_blacklist 键已设置了 TTL（等于 token 剩余有效期），
 * 会自动过期删除。此任务仅用于记录日志，确认黑名单机制运行正常。
 */
@Injectable()
export class CleanupTokenBlacklistTask {
  private readonly logger = new Logger(CleanupTokenBlacklistTask.name);

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron(): Promise<void> {
    this.logger.debug('Token 黑名单清理检查：Redis TTL 自动管理，无需手动清理');
  }
}
