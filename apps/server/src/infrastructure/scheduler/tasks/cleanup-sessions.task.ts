import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { SessionEntity } from '@/core/auth/infrastructure/persistence/relational/entities/session.entity';

/**
 * 定时清理过期 Session（每天凌晨 3:00 执行）
 *
 * 清理规则：expiresAt 已过期的 session 记录
 */
@Injectable()
export class CleanupSessionsTask {
  private readonly logger = new Logger(CleanupSessionsTask.name);

  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessionRepo: Repository<SessionEntity>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleCron(): Promise<void> {
    const now = new Date();
    const result = await this.sessionRepo.delete({
      expiresAt: LessThan(now),
    });
    if (result.affected && result.affected > 0) {
      this.logger.log(`已清理 ${result.affected} 条过期 Session`);
    }
  }
}
