import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponEntity } from './infrastructure/persistence/relational/entities/coupon.entity';
import { CouponHistoryEntity } from './infrastructure/persistence/relational/entities/coupon-history.entity';
import { CouponProductRelationEntity } from './infrastructure/persistence/relational/entities/coupon-product-relation.entity';
import { CouponProductCategoryRelationEntity } from './infrastructure/persistence/relational/entities/coupon-product-category-relation.entity';
import { CouponService } from './coupon.service';
import { CouponController, CouponHistoryController } from './coupon.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CouponEntity,
      CouponHistoryEntity,
      CouponProductRelationEntity,
      CouponProductCategoryRelationEntity,
    ]),
  ],
  controllers: [CouponController, CouponHistoryController],
  providers: [CouponService],
  exports: [CouponService],
})
export class CouponModule {}
