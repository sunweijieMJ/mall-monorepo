import { registerAs } from '@nestjs/config';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import validateConfig from '../../common/validate-config';
import { ThrottlerConfig } from './throttler-config.type';

class EnvironmentVariablesValidator {
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  THROTTLER_ENABLED: boolean;

  @IsInt()
  @Min(1000)
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  THROTTLER_TTL: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  THROTTLER_LIMIT: number;
}

export default registerAs<ThrottlerConfig>('throttler', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);
  return {
    enabled: process.env.THROTTLER_ENABLED !== 'false',
    ttl: parseInt(process.env.THROTTLER_TTL ?? '60000', 10),
    limit: parseInt(process.env.THROTTLER_LIMIT ?? '100', 10),
  };
});
