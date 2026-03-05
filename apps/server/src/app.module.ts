import { randomUUID } from 'crypto';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { LoggerModule } from 'nestjs-pino';

import appConfig from './config/app.config';
import authConfig from './core/auth/config/auth.config';
import databaseConfig from './infrastructure/database/config/database.config';
import redisConfig from './infrastructure/redis/config/redis.config';
import throttlerConfig from './infrastructure/throttler/throttler.config';
import loggerConfig from './infrastructure/logger/config/logger.config';
import { TypeOrmConfigService } from './infrastructure/database/typeorm-config.service';
import { AllConfigType } from './config/config.type';
import { CacheModule } from './infrastructure/cache/cache.module';
import { ThrottlerModule } from './infrastructure/throttler/throttler.module';
import { TransactionModule } from './infrastructure/database/transaction/transaction.module';

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
      ],
      envFilePath: ['.env'],
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
                'req.headers.authorization',
                'req.headers.cookie',
                'req.body.password',
                'req.body.authCode',
                'req.query.token',
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
  ],
})
export class AppModule {}
