/**
 * OpenAPI 文档转换器
 *
 * 功能：
 * 1. 过滤 admin 前端不需要的路由（portal、health、metrics）
 * 2. 同步清理 components/schemas 中未被引用的类型，避免生成多余 model
 */

import type {
  OpenAPIObject,
  SchemaObject,
  ReferenceObject,
} from 'openapi3-ts/oas30';

/**
 * 需要过滤的路径模式
 * - /admin/ : 后台接口
 * - /health : 健康检查
 * - /metrics : 监控指标
 */
const EXCLUDED_PATH_PATTERNS = ['/admin/', '/health', '/metrics'];

/**
 * 从 $ref 字符串中提取 schema 名称
 * 例：'#/components/schemas/CreateOrderDto' => 'CreateOrderDto'
 */
function extractSchemaName(ref: string): string | null {
  const match = ref.match(/^#\/components\/schemas\/(.+)$/);
  return match ? match[1] : null;
}

/**
 * 递归收集一个对象中所有 $ref 引用的 schema 名称
 */
function collectRefs(
  node: unknown,
  allSchemas: Record<string, SchemaObject | ReferenceObject>,
  collected: Set<string>,
): void {
  if (!node || typeof node !== 'object') return;

  if (Array.isArray(node)) {
    node.forEach((item) => collectRefs(item, allSchemas, collected));
    return;
  }

  const obj = node as Record<string, unknown>;

  if (typeof obj['$ref'] === 'string') {
    const name = extractSchemaName(obj['$ref']);
    if (name && !collected.has(name)) {
      collected.add(name);
      // 递归收集该 schema 内部的 $ref（避免遗漏嵌套引用）
      if (allSchemas[name]) {
        collectRefs(allSchemas[name], allSchemas, collected);
      }
    }
    return;
  }

  for (const value of Object.values(obj)) {
    collectRefs(value, allSchemas, collected);
  }
}

export default (inputSchema: OpenAPIObject): OpenAPIObject => {
  if (!inputSchema.paths) return inputSchema;

  // 第一步：过滤路由
  const filteredPaths: typeof inputSchema.paths = {};
  for (const [path, pathItem] of Object.entries(inputSchema.paths)) {
    if (EXCLUDED_PATH_PATTERNS.some((pattern) => path.includes(pattern)))
      continue;
    filteredPaths[path] = pathItem;
  }

  // 第二步：收集所有被引用的 schema 名称
  // 扫描范围：filteredPaths + components 中非 schemas 部分（responses/requestBodies 等）
  // 原因：NestJS 会把全局错误响应放到 components.responses，paths 通过
  // "$ref": "#/components/responses/..." 引用它们，这类 ref 不是 schemas 格式，
  // 如果只扫描 filteredPaths，会漏掉 responses 中的 schema 引用链。
  const allSchemas = (inputSchema.components?.schemas ?? {}) as Record<
    string,
    SchemaObject | ReferenceObject
  >;
  const { schemas: _schemas, ...otherComponents } =
    inputSchema.components ?? {};
  const usedSchemas = new Set<string>();
  collectRefs(filteredPaths, allSchemas, usedSchemas);
  collectRefs(otherComponents, allSchemas, usedSchemas);

  // 第三步：只保留被引用的 schemas
  const filteredSchemas: typeof allSchemas = {};
  for (const name of usedSchemas) {
    if (allSchemas[name]) {
      filteredSchemas[name] = allSchemas[name];
    }
  }

  return {
    ...inputSchema,
    paths: filteredPaths,
    components: {
      ...inputSchema.components,
      schemas: filteredSchemas,
    },
  };
};
