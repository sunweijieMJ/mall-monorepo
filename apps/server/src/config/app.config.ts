import { registerAs } from '@nestjs/config';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import validateConfig from '@/common/validate-config';
import { AppConfig } from './app-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  APP_NAME: string;

  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  APP_PORT: number;

  @IsString()
  @IsOptional()
  API_PREFIX: string;

  @IsString()
  @IsOptional()
  APP_FALLBACK_LANGUAGE: string;

  @IsString()
  @IsOptional()
  APP_HEADER_LANGUAGE: string;

  @IsString()
  @IsOptional()
  ALIYUN_OSS_ENDPOINT: string;

  @IsString()
  @IsOptional()
  ALIYUN_OSS_BUCKET_NAME: string;

  @IsString()
  @IsOptional()
  ALIYUN_OSS_ACCESS_KEY_ID: string;

  @IsString()
  @IsOptional()
  ALIYUN_OSS_ACCESS_KEY_SECRET: string;

  @IsString()
  @IsOptional()
  ALIYUN_OSS_DIR: string;
}

export default registerAs<AppConfig>('app', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);
  return {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    name: process.env.APP_NAME ?? 'Mall API',
    workingDirectory: process.env.PWD ?? process.cwd(),
    frontendDomain: process.env.FRONTEND_DOMAIN,
    backendDomain: process.env.BACKEND_DOMAIN,
    port: parseInt(process.env.APP_PORT ?? '3001', 10),
    apiPrefix: process.env.API_PREFIX ?? 'api',
    fallbackLanguage: process.env.APP_FALLBACK_LANGUAGE ?? 'zh',
    headerLanguage: process.env.APP_HEADER_LANGUAGE ?? 'x-custom-lang',
    aliyun: {
      oss: {
        endpoint: process.env.ALIYUN_OSS_ENDPOINT ?? '',
        bucketName: process.env.ALIYUN_OSS_BUCKET_NAME ?? '',
        accessKeyId: process.env.ALIYUN_OSS_ACCESS_KEY_ID ?? '',
        accessKeySecret: process.env.ALIYUN_OSS_ACCESS_KEY_SECRET ?? '',
        dir: process.env.ALIYUN_OSS_DIR ?? 'mall/',
      },
    },
  };
});
