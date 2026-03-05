import { registerAs } from '@nestjs/config';
import { RedisConfig } from './redis-config.type';

export default registerAs<RedisConfig>('redis', () => ({
  enabled: process.env.REDIS_ENABLED !== 'false',
  host: process.env.REDIS_HOST ?? 'localhost',
  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB ?? '0', 10),
}));
