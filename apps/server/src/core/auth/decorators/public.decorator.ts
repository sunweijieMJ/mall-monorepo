import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * 标记值：在 OpenAPI 后处理阶段识别并替换为 security: []（无需认证）
 * @see main.ts postProcessOpenApiDocument
 */
export const PUBLIC_SECURITY_MARKER = '__public__';

/** 标记接口为公开（跳过 JWT 鉴权），同时在 Swagger 中标注无需认证 */
export const Public = () =>
  applyDecorators(
    SetMetadata(IS_PUBLIC_KEY, true),
    ApiSecurity(PUBLIC_SECURITY_MARKER),
  );
