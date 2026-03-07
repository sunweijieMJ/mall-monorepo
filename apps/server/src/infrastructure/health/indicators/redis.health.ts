import { Inject, Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { AllConfigType } from '../../../config/config.type';
import { REDIS_CLIENT } from '../../redis/redis-client.module';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
  ) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const enabled = this.configService.get('redis.enabled', { infer: true });
    if (!enabled) {
      return this.getStatus(key, true, { message: 'Redis 已禁用' });
    }

    try {
      const pong = await this.redisClient.ping();
      if (pong === 'PONG') {
        return this.getStatus(key, true);
      }
      throw new HealthCheckError('Redis ping 失败', this.getStatus(key, false));
    } catch (error) {
      throw new HealthCheckError(
        'Redis 健康检查失败',
        this.getStatus(key, false, {
          message: error instanceof Error ? error.message : '未知错误',
        }),
      );
    }
  }
}
