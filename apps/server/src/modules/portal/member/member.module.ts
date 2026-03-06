import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  MemberEntity,
  MemberAddressEntity,
} from './infrastructure/persistence/relational/entities/member.entity';
import { CouponEntity } from '@/modules/sms/coupon/infrastructure/persistence/relational/entities/coupon.entity';
import { CouponHistoryEntity } from '@/modules/sms/coupon/infrastructure/persistence/relational/entities/coupon-history.entity';
import { CouponProductRelationEntity } from '@/modules/sms/coupon/infrastructure/persistence/relational/entities/coupon-product-relation.entity';
import { CouponProductCategoryRelationEntity } from '@/modules/sms/coupon/infrastructure/persistence/relational/entities/coupon-product-category-relation.entity';
import { ProductEntity } from '@/modules/pms/product/infrastructure/persistence/relational/entities/product.entity';
import { CartItemEntity } from '@/modules/portal/cart/infrastructure/persistence/relational/entities/cart-item.entity';
import { MemberService } from './member.service';
import {
  MemberInfoController,
  MemberAddressController,
  MemberCouponController,
  PortalCouponController,
} from './member.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MemberEntity,
      MemberAddressEntity,
      CouponEntity,
      CouponHistoryEntity,
      CouponProductRelationEntity,
      CouponProductCategoryRelationEntity,
      ProductEntity,
      CartItemEntity,
    ]),
  ],
  controllers: [
    MemberInfoController,
    MemberAddressController,
    MemberCouponController,
    PortalCouponController,
  ],
  providers: [MemberService],
  exports: [MemberService],
})
export class PortalMemberModule {}
