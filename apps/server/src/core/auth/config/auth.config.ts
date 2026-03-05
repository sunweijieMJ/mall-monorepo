import { registerAs } from '@nestjs/config';
import { IsString } from 'class-validator';
import validateConfig from '@/common/validate-config';
import { AuthConfig } from './auth-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  AUTH_JWT_SECRET: string;

  @IsString()
  AUTH_JWT_TOKEN_EXPIRES_IN: string;
}

export default registerAs<AuthConfig>('auth', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);
  return {
    secret: process.env.AUTH_JWT_SECRET ?? 'mall-secret-key',
    expires: process.env.AUTH_JWT_TOKEN_EXPIRES_IN ?? '15m',
    refreshSecret: process.env.AUTH_REFRESH_SECRET,
    refreshExpires: process.env.AUTH_REFRESH_TOKEN_EXPIRES_IN ?? '3650d',
    forgotSecret: process.env.AUTH_FORGOT_SECRET,
    forgotExpires: process.env.AUTH_FORGOT_TOKEN_EXPIRES_IN ?? '30m',
    confirmEmailSecret: process.env.AUTH_CONFIRM_EMAIL_SECRET,
    confirmEmailExpires:
      process.env.AUTH_CONFIRM_EMAIL_TOKEN_EXPIRES_IN ?? '1d',
  };
});
