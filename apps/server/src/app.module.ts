import { randomUUID } from 'crypto';
import * as path from 'path';
import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { LoggerModule } from 'nestjs-pino';
import {
  I18nModule,
  AcceptLanguageResolver,
  HeaderResolver,
  QueryResolver,
} from 'nestjs-i18n';

import appConfig from './config/app.config';
import authConfig from './core/auth/config/auth.config';
import databaseConfig from './infrastructure/database/config/database.config';
import redisConfig from './infrastructure/redis/config/redis.config';
import throttlerConfig from './infrastructure/throttler/throttler.config';
import loggerConfig from './infrastructure/logger/config/logger.config';
import metricsConfig from './infrastructure/metrics/metrics.config';
import { TypeOrmConfigService } from './infrastructure/database/typeorm-config.service';
import { AllConfigType } from './config/config.type';
import { CacheModule } from './infrastructure/cache/cache.module';
import { ThrottlerModule } from './infrastructure/throttler/throttler.module';
import { TransactionModule } from './infrastructure/database/transaction/transaction.module';
import { TransactionInterceptor } from './infrastructure/database/transaction/transaction.interceptor';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AuditModule } from './infrastructure/audit/audit.module';
import { AuditInterceptor } from './infrastructure/audit/audit.interceptor';
import { NotificationModule } from './infrastructure/notification/notification.module';
import { SchedulerModule } from './infrastructure/scheduler/scheduler.module';
import { MetricsModule } from './infrastructure/metrics/metrics.module';

// Core
import { AuthModule } from './core/auth/auth.module';
import { JwtAuthGuard } from './core/auth/guards/jwt-auth.guard';
import { ResourceGuard } from './core/auth/guards/resource.guard';

// PMS 商品管理
import { BrandModule } from './modules/pms/brand/brand.module';
import { ProductModule } from './modules/pms/product/product.module';
import { ProductCategoryModule } from './modules/pms/product-category/product-category.module';
import { ProductAttrModule } from './modules/pms/product-attr/product-attr.module';
import { SkuStockModule } from './modules/pms/sku-stock/sku-stock.module';

// OMS 订单管理
import { OrderModule } from './modules/oms/order/order.module';
import { ReturnApplyModule } from './modules/oms/return-apply/return-apply.module';
import { ReturnReasonModule } from './modules/oms/return-reason/return-reason.module';
import { OrderSettingModule } from './modules/oms/order-setting/order-setting.module';
import { CompanyAddressModule } from './modules/oms/company-address/company-address.module';

// SMS 营销管理
import { CouponModule } from './modules/sms/coupon/coupon.module';
import { FlashPromotionModule } from './modules/sms/flash-promotion/flash-promotion.module';
import { HomeContentModule } from './modules/sms/home-content/home-content.module';

// CMS 内容管理
import { SubjectModule } from './modules/cms/subject/subject.module';
import { PrefrenceAreaModule } from './modules/cms/prefrence-area/prefrence-area.module';

// UMS 权限管理
import { AdminUserModule } from './modules/ums/admin-user/admin-user.module';
import { AdminRoleModule } from './modules/ums/admin-role/admin-role.module';
import { AdminMenuModule } from './modules/ums/admin-menu/admin-menu.module';
import { AdminResourceModule } from './modules/ums/admin-resource/admin-resource.module';
import { MemberLevelModule } from './modules/ums/member-level/member-level.module';

// Portal 移动端专属
import { CartModule } from './modules/portal/cart/cart.module';
import { PortalHomeModule } from './modules/portal/home/home.module';
import { PortalMemberModule } from './modules/portal/member/member.module';
import { AttentionModule } from './modules/portal/attention/attention.module';
import { CollectionModule } from './modules/portal/collection/collection.module';
import { ReadHistoryModule } from './modules/portal/read-history/read-history.module';
import { PortalProductModule } from './modules/portal/product/portal-product.module';
import { PaymentModule } from './modules/portal/payment/payment.module';

// 其他
import { OssModule } from './modules/oss/oss.module';
import { HealthModule } from './infrastructure/health/health.module';

@Module({
  imports: [
    // 配置模块（全局）
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        authConfig,
        databaseConfig,
        redisConfig,
        throttlerConfig,
        loggerConfig,
        metricsConfig,
      ],
      envFilePath: ['.env'],
    }),

    // i18n 国际化（全局）
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService<AllConfigType>) => ({
        fallbackLanguage:
          configService.get('app.fallbackLanguage', { infer: true }) || 'zh',
        loaderOptions: {
          path: path.join(__dirname, '/i18n/'),
          watch: true,
        },
      }),
      resolvers: [
        new HeaderResolver(['x-custom-lang']),
        new QueryResolver(['lang']),
        AcceptLanguageResolver,
      ],
      inject: [ConfigService],
    }),

    // Pino 结构化日志（全局）
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<AllConfigType>) => {
        const logLevel = configService.get('logger.level', { infer: true });
        const prettyPrint = configService.get('logger.prettyPrint', {
          infer: true,
        });
        return {
          pinoHttp: {
            level: logLevel,
            transport: prettyPrint
              ? {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    singleLine: true,
                    translateTime: 'SYS:standard',
                  },
                }
              : undefined,
            // 从请求头读取 requestId，或生成 UUID，用于链路追踪
            genReqId: (req) =>
              (req.headers['x-request-id'] as string) || randomUUID(),
            // 按 HTTP 状态码分配日志级别（4xx → warn，5xx → error）
            customLogLevel: (_req, res, err) => {
              if (res.statusCode >= 500 || err) return 'error';
              if (res.statusCode >= 400) return 'warn';
              return 'info';
            },
            customSuccessMessage: (req, res) =>
              `${req.method} ${req.url} ${res.statusCode}`,
            customErrorMessage: (req, res, err) =>
              `${req.method} ${req.url} ${res.statusCode} - ${err.message}`,
            // 自动脱敏敏感字段
            redact: {
              paths: [
                // 认证信息
                'req.headers.authorization',
                'req.headers.cookie',
                'req.query.token',
                // 密码类
                'req.body.password',
                'req.body.newPassword',
                'req.body.oldPassword',
                'req.body.confirmPassword',
                // 验证码
                'req.body.authCode',
                'req.body.verificationCode',
                'req.body.smsCode',
                // 个人隐私
                'req.body.phone',
                'req.body.telephone',
                'req.body.email',
                'req.body.idCard',
                'req.body.bankCard',
                // 支付信息
                'req.body.privateKey',
                'req.body.secret',
                // Token
                'req.body.refreshToken',
                'req.body.token',
              ],
              censor: '[REDACTED]',
            },
          },
        };
      },
      inject: [ConfigService],
    }),

    // 速率限制（全局，支持 THROTTLER_ENABLED=false 关闭）
    ThrottlerModule,

    // 数据库模块（全局）
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),

    // Redis 缓存模块（全局，Redis 不可用时自动降级为内存缓存）
    CacheModule,

    // 事务模块（全局，提供 TransactionService 替代直接注入 DataSource）
    TransactionModule,

    // 审计日志模块（全局，提供 @Auditable 装饰器 + AuditInterceptor）
    AuditModule,

    // 消息通知模块（全局，基于 BullMQ 异步队列）
    NotificationModule,

    // 定时任务模块（基于 @nestjs/schedule，清理过期 Session / Token 黑名单）
    SchedulerModule,

    // Prometheus 指标模块（全局，提供 /metrics 端点 + HTTP 请求计数/延迟直方图）
    MetricsModule,

    // BullMQ 队列模块（全局）
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<AllConfigType>) => ({
        connection: {
          host: configService.getOrThrow('redis.host', { infer: true }),
          port: configService.getOrThrow('redis.port', { infer: true }),
          password: configService.get('redis.password', { infer: true }),
          db: configService.get('redis.db', { infer: true }),
        },
        defaultJobOptions: {
          // 完成后保留最近 100 条，失败后保留最近 1000 条（防 Redis 无限膨胀）
          removeOnComplete: 100,
          removeOnFail: 1000,
          // 失败后最多重试 3 次，指数退避避免雪崩
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
        },
      }),
      inject: [ConfigService],
    }),

    // Core
    AuthModule,

    // PMS
    BrandModule,
    ProductModule,
    ProductCategoryModule,
    ProductAttrModule,
    SkuStockModule,

    // OMS
    OrderModule,
    ReturnApplyModule,
    ReturnReasonModule,
    OrderSettingModule,
    CompanyAddressModule,

    // SMS
    CouponModule,
    FlashPromotionModule,
    HomeContentModule,

    // CMS
    SubjectModule,
    PrefrenceAreaModule,

    // UMS
    AdminUserModule,
    AdminRoleModule,
    AdminMenuModule,
    AdminResourceModule,
    MemberLevelModule,

    // Portal
    CartModule,
    PortalHomeModule,
    PortalMemberModule,
    AttentionModule,
    CollectionModule,
    ReadHistoryModule,
    PortalProductModule,
    PaymentModule,

    // 其他
    OssModule,
    HealthModule,
  ],
  providers: [
    // JWT 认证守卫（第一层）
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // 动态资源权限守卫（第二层）
    {
      provide: APP_GUARD,
      useClass: ResourceGuard,
    },
    // 响应包装拦截器（全局，包装为 {code, message, data}）
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    // 声明式事务拦截器（全局，配合 @Transactional() 装饰器）
    {
      provide: APP_INTERCEPTOR,
      useClass: TransactionInterceptor,
    },
    // 审计日志拦截器（全局，配合 @Auditable() 装饰器）
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}
