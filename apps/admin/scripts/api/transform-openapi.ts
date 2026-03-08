/**
 * OpenAPI 文档转换器（最小化版本）
 *
 * 功能：仅过滤 admin 前端不需要的路由（portal、health、metrics）
 * operationId 和 tags 保持 NestJS 默认生成，不做任何转换
 */

import type { OpenAPIObject } from 'openapi3-ts/oas30';

/**
 * 需要过滤的路径模式
 * - /portal/ : 移动端接口
 * - /health : 健康检查
 * - /metrics : 监控指标
 */
const EXCLUDED_PATH_PATTERNS = ['/portal/', '/health', '/metrics'];

export default (inputSchema: OpenAPIObject): OpenAPIObject => {
  if (!inputSchema.paths) return inputSchema;

  const filteredPaths: typeof inputSchema.paths = {};

  for (const [path, pathItem] of Object.entries(inputSchema.paths)) {
    // 排除 portal、health、metrics 路由
    if (EXCLUDED_PATH_PATTERNS.some((pattern) => path.includes(pattern)))
      continue;
    filteredPaths[path] = pathItem;
  }

  return { ...inputSchema, paths: filteredPaths };
};
