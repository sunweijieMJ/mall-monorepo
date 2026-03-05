import { AppConfig } from './app-config.type';
import { AuthConfig } from '@/core/auth/config/auth-config.type';
import { DatabaseConfig } from '@/infrastructure/database/config/database-config.type';
import { RedisConfig } from '@/infrastructure/redis/config/redis-config.type';

export type AllConfigType = {
  app: AppConfig;
  auth: AuthConfig;
  database: DatabaseConfig;
  redis: RedisConfig;
};
