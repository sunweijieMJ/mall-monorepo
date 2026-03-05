import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { AllConfigType } from '../../../config/config.type';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(private readonly configService: ConfigService<AllConfigType>) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const enabled = this.configService.get('redis.enabled', { infer: true });
    if (!enabled) {
      return this.getStatus(key, true, { message: 'Redis 已禁用' });
    }

    const host = this.configService.get('redis.host', { infer: true });
    const port = this.configService.get('redis.port', { infer: true });
    const password = this.configService.get('redis.password', { infer: true });
    const db = this.configService.get('redis.db', { infer: true });

    const redis = new Redis({
      host,
      port,
      password,
      db,
      connectTimeout: 5000,
      lazyConnect: true,
    });

    try {
      await redis.connect();
      const pong = await redis.ping();
      await redis.quit();

      if (pong === 'PONG') {
        return this.getStatus(key, true);
      }
      throw new HealthCheckError('Redis ping 失败', this.getStatus(key, false));
    } catch (error) {
      await redis.quit().catch(() => {});
      throw new HealthCheckError(
        'Redis 健康检查失败',
        this.getStatus(key, false, {
          message: error instanceof Error ? error.message : '未知错误',
        }),
      );
    }
  }
}
