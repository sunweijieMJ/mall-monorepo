import { registerAs } from '@nestjs/config';
import { MetricsConfig } from './metrics-config.type';

export default registerAs<MetricsConfig>('metrics', () => ({
  enabled: process.env.METRICS_ENABLED !== 'false',
  path: process.env.METRICS_PATH ?? 'metrics',
}));
