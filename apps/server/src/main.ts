import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import {
  ApiErrorResponse,
  ApiResponse as ApiResponseDto,
} from './common/dto/api-response.dto';
import type { OpenAPIObject } from '@nestjs/swagger';
import validationOptions from './common/validation-options';
import { AllConfigType } from './config/config.type';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // 使用 Pino 作为应用日志（替代默认 NestJS Logger）
  app.useLogger(app.get(Logger));

  // 支持 class-validator 自定义验证器使用 NestJS DI
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // 优雅关闭：响应 SIGTERM/SIGINT（K8s/Docker 部署必需）
  app.enableShutdownHooks();

  const configService = app.get(ConfigService<AllConfigType>);
  const port = configService.getOrThrow('app.port', { infer: true });
  const nodeEnv = configService.getOrThrow('app.nodeEnv', { infer: true });
  const frontendDomain = configService.get('app.frontendDomain', {
    infer: true,
  });

  // 安全：helmet + CSP（允许 Swagger UI 加载内联样式/脚本）
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          scriptSrc: ["'self'", "'unsafe-inline'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // CORS：生产环境使用白名单，开发环境允许所有来源
  const corsOrigin =
    nodeEnv === 'production'
      ? frontendDomain
        ? frontendDomain.split(',').map((d: string) => d.trim())
        : false // 生产环境未配置域名则拒绝跨域
      : true; // 开发环境允许所有来源
  app.enableCors({
    origin: corsOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // API 版本（URI 版本：/v1/...）
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // 全局前缀
  app.setGlobalPrefix('api', {
    exclude: ['/'],
  });

  // 全局管道（参数校验）
  app.useGlobalPipes(new ValidationPipe(validationOptions));

  // 全局异常过滤器
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  // Swagger 文档
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Mall API')
    .setDescription(
      'Mall 电商平台接口文档（管理端 + 移动端）' +
        '&nbsp;&nbsp;|&nbsp;&nbsp;' +
        '<a href="/openapi.json" target="_blank">OpenAPI JSON</a>',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'admin-jwt',
    )
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'portal-jwt',
    )
    .addTag('admin-auth', '管理端 - 认证')
    .addTag('admin-brand', '管理端 - 品牌管理')
    .addTag('admin-product', '管理端 - 商品管理')
    .addTag('admin-product-attr', '管理端 - 商品属性')
    .addTag('admin-product-attr-category', '管理端 - 商品属性分类')
    .addTag('admin-product-category', '管理端 - 商品分类')
    .addTag('admin-sku-stock', '管理端 - SKU库存')
    .addTag('admin-order', '管理端 - 订单管理')
    .addTag('admin-order-setting', '管理端 - 订单设置')
    .addTag('admin-return-apply', '管理端 - 退货申请')
    .addTag('admin-return-reason', '管理端 - 退货原因')
    .addTag('admin-company-address', '管理端 - 公司地址')
    .addTag('admin-coupon', '管理端 - 优惠券')
    .addTag('admin-flash-promotion', '管理端 - 秒杀活动')
    .addTag('admin-flash-session', '管理端 - 秒杀场次')
    .addTag('admin-flash-product-relation', '管理端 - 秒杀商品关联')
    .addTag('admin-home-ad', '管理端 - 首页广告')
    .addTag('admin-home-brand', '管理端 - 首页品牌推荐')
    .addTag('admin-home-subject', '管理端 - 首页专题推荐')
    .addTag('admin-home-new-product', '管理端 - 首页新品推荐')
    .addTag('admin-home-recommend-product', '管理端 - 首页人气推荐')
    .addTag('admin-subject', '管理端 - 专题')
    .addTag('admin-preference-area', '管理端 - 优选专区')
    .addTag('admin-user', '管理端 - 用户管理')
    .addTag('admin-role', '管理端 - 角色管理')
    .addTag('admin-menu', '管理端 - 菜单管理')
    .addTag('admin-resource', '管理端 - 资源管理')
    .addTag('admin-resource-category', '管理端 - 资源分类')
    .addTag('admin-member-level', '管理端 - 会员等级')
    .addTag('admin-oss', '管理端 - OSS存储')
    .addTag('portal-auth', '移动端 - 认证')
    .addTag('portal-brand', '移动端 - 品牌')
    .addTag('portal-product', '移动端 - 商品')
    .addTag('portal-cart', '移动端 - 购物车')
    .addTag('portal-order', '移动端 - 订单')
    .addTag('portal-member-profile', '移动端 - 会员信息')
    .addTag('portal-member-address', '移动端 - 收货地址')
    .addTag('portal-coupon', '移动端 - 优惠券')
    .addTag('portal-attention', '移动端 - 品牌关注')
    .addTag('portal-collection', '移动端 - 商品收藏')
    .addTag('portal-read-history', '移动端 - 浏览历史')
    .addTag('portal-return-apply', '移动端 - 退货申请')
    .addTag('portal-payment', '移动端 - 支付')
    .addTag('portal-home', '移动端 - 首页')
    .addTag('health', '健康检查')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    extraModels: [ApiErrorResponse, ApiResponseDto],
  });

  // 后置处理：补全响应包装 + 全局错误响应 + 类型修正
  postProcessOpenApiDocument(document);

  // 修正 Schema 中 enum 值全为整数的 number 类型为 integer
  fixEnumIntegerSchemas(document);

  // 补全 /api/metrics 的 Swagger 信息（由 @willsoto/nestjs-prometheus 自动注册，无法直接加装饰器）
  const metricsOp = (document.paths?.['/api/metrics'] as any)?.get;
  if (metricsOp) {
    metricsOp.summary = metricsOp.summary || 'Prometheus 指标数据';
    metricsOp.tags = metricsOp.tags?.length ? metricsOp.tags : ['health'];
  }

  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: '/openapi.json',
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(port);
  const logger = app.get(Logger);
  logger.log(`Server running on http://localhost:${port}`, 'Bootstrap');
  logger.log(`Swagger docs: http://localhost:${port}/docs`, 'Bootstrap');
  logger.log(
    `OpenAPI JSON: http://localhost:${port}/openapi.json`,
    'Bootstrap',
  );
}

bootstrap();

/**
 * OpenAPI 文档后置处理：
 * 1. 为未使用 @ApiWrappedResponse 的接口自动补全 ApiResponse 包装
 * 2. 添加全局 401/403/404 错误响应定义并引用到各接口
 */
function postProcessOpenApiDocument(document: OpenAPIObject): void {
  const apiResponseRef = '#/components/schemas/ApiResponse';
  const errorRef = '#/components/schemas/ApiErrorResponse';

  // 不需要 ApiResponse 包装的路径（无 ResponseInterceptor 或使用了 @SkipResponseTransform）
  const skipWrappingPaths = new Set([
    '/api/metrics',
    '/api/v1/health',
    '/api/v1/portal/payment/alipay/notify',
  ]);

  // 1. 注册全局错误响应到 components/responses
  document.components = document.components ?? {};
  document.components.responses = {
    ...document.components.responses,
    UnauthorizedResponse: {
      description: '未认证 - Token 缺失或已过期',
      content: {
        'application/json': { schema: { $ref: errorRef } },
      },
    },
    ForbiddenResponse: {
      description: '无权限 - 当前用户无此操作权限',
      content: {
        'application/json': { schema: { $ref: errorRef } },
      },
    },
    NotFoundResponse: {
      description: '资源不存在',
      content: {
        'application/json': { schema: { $ref: errorRef } },
      },
    },
    BadRequestResponse: {
      description: '请求参数校验失败',
      content: {
        'application/json': { schema: { $ref: errorRef } },
      },
    },
  };

  // 2. 遍历所有路径/操作
  for (const [path, methods] of Object.entries(document.paths ?? {})) {
    for (const [, operation] of Object.entries(
      methods as Record<string, any>,
    )) {
      if (!operation || typeof operation !== 'object' || !operation.responses) {
        continue;
      }

      // 2a. 自动包装 200 响应的 schema
      if (!skipWrappingPaths.has(path)) {
        const res200 = operation.responses['200'] ?? operation.responses['201'];
        const schema = res200?.content?.['application/json']?.schema;

        if (schema && !isAlreadyWrapped(schema, apiResponseRef)) {
          res200.content['application/json'].schema = {
            allOf: [{ $ref: apiResponseRef }, { properties: { data: schema } }],
          };
        }
      }

      // 2b. 将 ID / 分页等整数参数的 type 从 number 修正为 integer
      fixIntegerParameters(operation);

      // 2c. 将 query 参数中 enum 值全为整数的 number 类型修正为 integer
      fixEnumIntegerQueryParams(operation);

      // 2c. 处理 @Public() 标记：将含 __public__ 标记的 security 替换为空数组（无需认证）
      if (
        Array.isArray(operation.security) &&
        operation.security.some(
          (s: Record<string, unknown>) => '__public__' in s,
        )
      ) {
        operation.security = [];
      }

      // 2d. 为需要鉴权的接口添加 401/403 错误响应
      const hasSecurity =
        (operation.security?.length ?? 0) > 0 ||
        (!operation.security && (document.security?.length ?? 0) > 0);
      if (hasSecurity) {
        operation.responses['401'] = operation.responses['401'] ?? {
          $ref: '#/components/responses/UnauthorizedResponse',
        };
        operation.responses['403'] = operation.responses['403'] ?? {
          $ref: '#/components/responses/ForbiddenResponse',
        };
      }

      // 2e. 为包含路径参数的 GET/PUT/DELETE 接口自动添加 404 响应
      if (/\{[^}]+\}/.test(path)) {
        operation.responses['404'] = operation.responses['404'] ?? {
          $ref: '#/components/responses/NotFoundResponse',
        };
      }

      // 2f. 为有 requestBody 的接口添加 400 参数校验错误响应
      if (operation.requestBody && !skipWrappingPaths.has(path)) {
        operation.responses['400'] = operation.responses['400'] ?? {
          $ref: '#/components/responses/BadRequestResponse',
        };
      }
    }
  }
}

/** 将路径/查询参数中 ID 和分页参数的 type 从 number 修正为 integer */
function fixIntegerParameters(operation: Record<string, any>): void {
  if (!operation.parameters) return;
  for (const param of operation.parameters) {
    if (
      param.schema?.type === 'number' &&
      (param.name === 'id' ||
        /Id$/.test(param.name) ||
        ['pageNum', 'pageSize'].includes(param.name))
    ) {
      param.schema.type = 'integer';
    }
  }
}

/** 将 Schema 定义中 enum 值全为整数的 number 类型修正为 integer（修复 Swagger CLI 插件推断行为） */
function fixEnumIntegerSchemas(document: OpenAPIObject): void {
  for (const schema of Object.values(document.components?.schemas ?? {})) {
    if (typeof schema !== 'object' || !schema) continue;
    for (const prop of Object.values(
      (schema as Record<string, any>).properties ?? {},
    )) {
      if (
        typeof prop === 'object' &&
        prop !== null &&
        (prop as any).type === 'number' &&
        Array.isArray((prop as any).enum) &&
        (prop as any).enum.every((v: unknown) => Number.isInteger(v))
      ) {
        (prop as any).type = 'integer';
      }
    }
  }
}

/** 将查询参数中 enum 值全为整数的 number 类型修正为 integer */
function fixEnumIntegerQueryParams(operation: Record<string, any>): void {
  if (!operation.parameters) return;
  for (const param of operation.parameters) {
    if (
      param.schema?.type === 'number' &&
      Array.isArray(param.schema.enum) &&
      param.schema.enum.every((v: unknown) => Number.isInteger(v))
    ) {
      param.schema.type = 'integer';
    }
  }
}

/** 检查 schema 是否已被 ApiResponse allOf 包装 */
function isAlreadyWrapped(
  schema: Record<string, any>,
  apiResponseRef: string,
): boolean {
  return schema.allOf?.some((item: any) => item.$ref === apiResponseRef);
}
