import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { Public } from '@/core/auth/decorators/public.decorator';
import { RedisHealthIndicator } from './indicators/redis.health';

@ApiTags('健康检查')
@Controller({ path: 'health', version: '1' })
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly redis: RedisHealthIndicator,
  ) {}

  @Get()
  @Public()
  @HealthCheck()
  @ApiOperation({ summary: '服务健康检查（数据库 + Redis + 内存）' })
  check() {
    return this.health.check([
      // 数据库连接检查
      () => this.db.pingCheck('database'),
      // Redis 连接检查
      () => this.redis.isHealthy('redis'),
      // 内存堆使用不超过 512MB
      () => this.memory.checkHeap('memory_heap', 512 * 1024 * 1024),
    ]);
  }
}
