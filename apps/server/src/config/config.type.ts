import { AppConfig } from './app-config.type';
import { AuthConfig } from '@/core/auth/config/auth-config.type';
import { DatabaseConfig } from '@/infrastructure/database/config/database-config.type';
import { RedisConfig } from '@/infrastructure/redis/config/redis-config.type';
import { ThrottlerConfig } from '@/infrastructure/throttler/throttler-config.type';
import { LoggerConfig } from '@/infrastructure/logger/config/logger-config.type';
import { MetricsConfig } from '@/infrastructure/metrics/metrics-config.type';

export type AllConfigType = {
  app: AppConfig;
  auth: AuthConfig;
  database: DatabaseConfig;
  redis: RedisConfig;
  throttler: ThrottlerConfig;
  logger: LoggerConfig;
  metrics: MetricsConfig;
};
