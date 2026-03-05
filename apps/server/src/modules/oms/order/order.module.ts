import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';

import { OrderEntity } from './infrastructure/persistence/relational/entities/order.entity';
import { OrderItemEntity } from './infrastructure/persistence/relational/entities/order-item.entity';
import { OrderOperateHistoryEntity } from './infrastructure/persistence/relational/entities/order-operate-history.entity';
import { OrderSettingEntity } from '../order-setting/infrastructure/persistence/relational/entities/order-setting.entity';

import { CartItemEntity } from '../../portal/cart/infrastructure/persistence/relational/entities/cart-item.entity';
import { SkuStockEntity } from '../../pms/sku-stock/infrastructure/persistence/relational/entities/sku-stock.entity';
import { ProductEntity } from '../../pms/product/infrastructure/persistence/relational/entities/product.entity';
import { ProductLadderEntity } from '../../pms/product/infrastructure/persistence/relational/entities/product-ladder.entity';
import { ProductFullReductionEntity } from '../../pms/product/infrastructure/persistence/relational/entities/product-full-reduction.entity';
import {
  MemberEntity,
  MemberAddressEntity,
} from '../../portal/member/infrastructure/persistence/relational/entities/member.entity';
import { CouponEntity } from '../../sms/coupon/infrastructure/persistence/relational/entities/coupon.entity';
import { CouponHistoryEntity } from '../../sms/coupon/infrastructure/persistence/relational/entities/coupon-history.entity';
import { CouponProductRelationEntity } from '../../sms/coupon/infrastructure/persistence/relational/entities/coupon-product-relation.entity';
import { CouponProductCategoryRelationEntity } from '../../sms/coupon/infrastructure/persistence/relational/entities/coupon-product-category-relation.entity';
import { IntegrationConsumeSettingEntity } from '../../ums/member-level/infrastructure/persistence/relational/entities/integration-consume-setting.entity';

import { OrderService } from './order.service';
import {
  AdminOrderController,
  PortalOrderController,
} from './order.controller';
import { OrderCancelProcessor } from './order-cancel.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderEntity,
      OrderItemEntity,
      OrderOperateHistoryEntity,
      OrderSettingEntity,
      CartItemEntity,
      SkuStockEntity,
      ProductEntity,
      ProductLadderEntity,
      ProductFullReductionEntity,
      MemberEntity,
      MemberAddressEntity,
      CouponEntity,
      CouponHistoryEntity,
      CouponProductRelationEntity,
      CouponProductCategoryRelationEntity,
      IntegrationConsumeSettingEntity,
    ]),
    // 注册订单取消队列
    BullModule.registerQueue({ name: 'order-cancel' }),
  ],
  controllers: [AdminOrderController, PortalOrderController],
  providers: [OrderService, OrderCancelProcessor],
  exports: [OrderService],
})
export class OrderModule {}
