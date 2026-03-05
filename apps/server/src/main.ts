import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
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

  // 全局响应拦截器（包装为 {code, message, data}），需要 Reflector 来读取装饰器元数据
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new ResponseInterceptor(reflector));

  // 全局异常过滤器
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  // Swagger 文档
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Mall API')
    .setDescription('Mall 电商平台接口文档（管理端 + 移动端）')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'admin-jwt',
    )
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'portal-jwt',
    )
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(port);
  const logger = app.get(Logger);
  logger.log(`Server running on http://localhost:${port}`, 'Bootstrap');
  logger.log(`Swagger docs: http://localhost:${port}/docs`, 'Bootstrap');
}

bootstrap();
