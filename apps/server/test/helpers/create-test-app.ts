import {
  CanActivate,
  ExecutionContext,
  INestApplication,
  Injectable,
  Type,
  UnauthorizedException,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { APP_GUARD, HttpAdapterHost, Reflector } from '@nestjs/core';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { CacheModule, CACHE_MANAGER } from '@nestjs/cache-manager';
import { getDataSourceToken } from '@nestjs/typeorm';
import authConfig from '@/core/auth/config/auth.config';

import { ResponseInterceptor } from '@/common/interceptors/response.interceptor';
import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';
import validationOptions from '@/common/validation-options';
import { IS_PUBLIC_KEY } from '@/core/auth/decorators/public.decorator';
import type { JwtPayload } from '@/core/auth/types/jwt-payload.type';

import { TEST_JWT_SECRET } from './jwt.helper';
import { createMockCacheManager, createMockDataSource } from './mock.factory';

// ──────────────────────────────────────────────
// Mock Guards
// ──────────────────────────────────────────────

/**
 * 测试用 JwtAuthGuard：
 * - 放行 @Public() 路由
 * - 使用 TEST_JWT_SECRET 验证 Bearer Token（跳过 Redis 黑名单检查）
 * - Token 无效/缺失时抛出 401
 */
@Injectable()
class MockJwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'] as string | undefined;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('缺少认证 Token');
    }

    try {
      const token = authHeader.slice(7);
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: TEST_JWT_SECRET,
      });
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Token 无效或已过期');
    }
  }
}

/**
 * 测试用 ResourceGuard：直接放行，不校验动态资源权限。
 */
@Injectable()
class MockResourceGuard implements CanActivate {
  canActivate(): boolean {
    return true;
  }
}

// ──────────────────────────────────────────────
// Test App Factory
// ──────────────────────────────────────────────

/**
 * 创建集成测试用 NestJS 应用。
 *
 * 默认行为：
 * - 注册 MockJwtAuthGuard（使用 TEST_JWT_SECRET 验签，跳过 Redis 黑名单）
 * - 注册 MockResourceGuard（跳过动态权限校验）
 * - Mock TypeORM DataSource（防止 forFeature 初始化报错）
 * - Mock CACHE_MANAGER（防止 Redis 连接）
 * - 应用与 main.ts 一致的全局配置（版本、前缀、Pipe、Interceptor、Filter）
 *
 * @param featureModule 被测功能模块（如 BrandModule）
 * @param configure 自定义 override 回调，用于覆盖具体 Repository 等 provider
 *
 * @example
 * const app = await createTestApp(BrandModule, (builder) => {
 *   builder
 *     .overrideProvider(getRepositoryToken(BrandEntity))
 *     .useValue(mockBrandRepo);
 * });
 */
export async function createTestApp(
  featureModule: Type<any>,
  configure?: (builder: TestingModuleBuilder) => void,
): Promise<INestApplication> {
  const builder = Test.createTestingModule({
    imports: [
      // isGlobal: true 使 ConfigService 在所有子模块（包括 JwtModule.registerAsync）中可用
      // load: [authConfig] 注册 auth.* 命名空间，让 JwtModule.registerAsync 能读取 auth.secret
      ConfigModule.forRoot({
        isGlobal: true,
        ignoreEnvFile: true,
        load: [authConfig],
      }),
      // isGlobal: true 使 CACHE_MANAGER 在所有子模块（包括 AuthModule）中可用
      // 使用内存 store，不需要真实 Redis 连接
      CacheModule.register({ isGlobal: true }),
      // 提供 JwtService 供 MockJwtAuthGuard 使用
      JwtModule.register({
        secret: TEST_JWT_SECRET,
        signOptions: { expiresIn: '1h' },
      }),
      featureModule,
    ],
    providers: [
      { provide: APP_GUARD, useClass: MockJwtAuthGuard },
      { provide: APP_GUARD, useClass: MockResourceGuard },
    ],
  });

  // 默认 Mock 基础设施，防止 TypeORM / Redis / Config 初始化失败
  builder
    .overrideProvider(getDataSourceToken())
    .useValue(createMockDataSource())
    .overrideProvider(CACHE_MANAGER)
    .useValue(createMockCacheManager());

  // 测试自定义 overrides（如 overrideProvider(getRepositoryToken(BrandEntity))）
  configure?.(builder);

  const moduleRef = await builder.compile();
  const app = moduleRef.createNestApplication();

  // 与 main.ts 保持一致的全局配置
  app.enableVersioning({ type: VersioningType.URI });
  app.setGlobalPrefix('api', { exclude: ['/'] });
  app.useGlobalPipes(new ValidationPipe(validationOptions));

  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new ResponseInterceptor(reflector));

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  await app.init();
  return app;
}
