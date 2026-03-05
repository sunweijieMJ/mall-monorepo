import { registerAs } from '@nestjs/config';
import { DatabaseConfig } from './database-config.type';

export default registerAs<DatabaseConfig>('database', () => ({
  url: process.env.DATABASE_URL,
  type: process.env.DATABASE_TYPE ?? 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
  password: process.env.DATABASE_PASSWORD,
  name: process.env.DATABASE_NAME ?? 'mall',
  username: process.env.DATABASE_USERNAME,
  synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
  maxConnections: parseInt(process.env.DATABASE_MAX_CONNECTIONS ?? '100', 10),
  sslEnabled: process.env.DATABASE_SSL_ENABLED === 'true',
  rejectUnauthorized: process.env.DATABASE_REJECT_UNAUTHORIZED !== 'false',
  ca: process.env.DATABASE_CA,
  key: process.env.DATABASE_KEY,
  cert: process.env.DATABASE_CERT,
}));
