import { registerAs } from '@nestjs/config';
import { AuthConfig } from './auth-config.type';

export default registerAs<AuthConfig>('auth', () => ({
  secret: process.env.AUTH_JWT_SECRET,
  expires: process.env.AUTH_JWT_TOKEN_EXPIRES_IN ?? '15m',
  refreshSecret: process.env.AUTH_REFRESH_SECRET,
  refreshExpires: process.env.AUTH_REFRESH_TOKEN_EXPIRES_IN ?? '3650d',
  forgotSecret: process.env.AUTH_FORGOT_SECRET,
  forgotExpires: process.env.AUTH_FORGOT_TOKEN_EXPIRES_IN ?? '30m',
  confirmEmailSecret: process.env.AUTH_CONFIRM_EMAIL_SECRET,
  confirmEmailExpires: process.env.AUTH_CONFIRM_EMAIL_TOKEN_EXPIRES_IN ?? '1d',
}));
