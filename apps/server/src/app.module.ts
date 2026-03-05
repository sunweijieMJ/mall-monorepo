import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

import appConfig from './config/app.config';
import authConfig from './core/auth/config/auth.config';
import databaseConfig from './infrastructure/database/config/database.config';
import redisConfig from './infrastructure/redis/config/redis.config';
import { TypeOrmConfigService } from './infrastructure/database/typeorm-config.service';
import { AllConfigType } from './config/config.type';

// Core
import { AuthModule } from './core/auth/auth.module';

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

// UMS 权限管理
import { AdminUserModule } from './modules/ums/admin-user/admin-user.module';
import { AdminRoleModule } from './modules/ums/admin-role/admin-role.module';
import { AdminMenuModule } from './modules/ums/admin-menu/admin-menu.module';
import { AdminResourceModule } from './modules/ums/admin-resource/admin-resource.module';

// Portal 移动端专属
import { CartModule } from './modules/portal/cart/cart.module';
import { PortalHomeModule } from './modules/portal/home/home.module';
import { PortalMemberModule } from './modules/portal/member/member.module';

// 其他
import { OssModule } from './modules/oss/oss.module';

@Module({
  imports: [
    // 配置模块（全局）
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, databaseConfig, redisConfig],
      envFilePath: ['.env'],
    }),

    // 数据库模块（全局）
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),

    // Redis 缓存模块（全局）
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService<AllConfigType>) => {
        const host = configService.getOrThrow('redis.host', { infer: true });
        const port = configService.getOrThrow('redis.port', { infer: true });
        return {
          store: await redisStore({
            socket: { host, port },
          }),
        };
      },
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

    // UMS
    AdminUserModule,
    AdminRoleModule,
    AdminMenuModule,
    AdminResourceModule,

    // Portal
    CartModule,
    PortalHomeModule,
    PortalMemberModule,

    // 其他
    OssModule,
  ],
})
export class AppModule {}
