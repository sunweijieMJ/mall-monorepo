import { Global, Module, Logger } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';
import { AllConfigType } from '../../config/config.type';

/** 默认缓存 TTL：1 小时（cache-manager v7 单位毫秒） */
const CACHE_TTL_MS = 3600 * 1000;

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<AllConfigType>) => {
        const logger = new Logger('CacheModule');
        const redisEnabled = configService.get('redis.enabled', {
          infer: true,
        });

        if (redisEnabled) {
          const host = configService.get('redis.host', { infer: true });
          const port = configService.get('redis.port', { infer: true });
          const password = configService.get('redis.password', { infer: true });
          const db = configService.get('redis.db', { infer: true });

          try {
            logger.log(`正在连接 Redis ${host}:${port}`);
            const store = await redisStore({
              socket: { host, port, connectTimeout: 5000 },
              password,
              database: db,
            });
            logger.log('Redis 连接成功');
            return { store, ttl: CACHE_TTL_MS };
          } catch (error) {
            logger.warn(
              `Redis 连接失败（${error instanceof Error ? error.message : '未知错误'}），降级为内存缓存`,
            );
          }
        } else {
          logger.log('Redis 已禁用，使用内存缓存');
        }

        return { ttl: CACHE_TTL_MS };
      },
    }),
  ],
  exports: [NestCacheModule],
})
export class CacheModule {}
