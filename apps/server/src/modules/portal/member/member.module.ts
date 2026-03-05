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
import { MemberService } from './member.service';
import {
  MemberInfoController,
  MemberAddressController,
  MemberCouponController,
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
    ]),
  ],
  controllers: [
    MemberInfoController,
    MemberAddressController,
    MemberCouponController,
  ],
  providers: [MemberService],
  exports: [MemberService],
})
export class PortalMemberModule {}
