import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { AllConfigType } from '@/config/config.type';

/** 全局 Redis 客户端 Token */
export const REDIS_CLIENT = 'REDIS_CLIENT';

/**
 * 全局 Redis 客户端模块
 * 提供 ioredis 实例供需要直接执行 Redis 命令的模块使用（如 INCR、EXPIRE）
 * 与 CacheModule 的 cache-manager 互相独立，职责分离
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AllConfigType>): Redis => {
        return new Redis({
          host: configService.getOrThrow('redis.host', { infer: true }),
          port: configService.getOrThrow('redis.port', { infer: true }),
          password: configService.get('redis.password', { infer: true }),
          db: configService.get('redis.db', { infer: true }) ?? 0,
          // 连接失败时自动重连，不阻塞业务启动
          lazyConnect: false,
          maxRetriesPerRequest: 3,
        });
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisClientModule {}
