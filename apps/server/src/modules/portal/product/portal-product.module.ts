import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductEntity } from '@/modules/pms/product/infrastructure/persistence/relational/entities/product.entity';
import { BrandEntity } from '@/modules/pms/brand/infrastructure/persistence/relational/entities/brand.entity';
import { SkuStockEntity } from '@/modules/pms/sku-stock/infrastructure/persistence/relational/entities/sku-stock.entity';
import { ProductAttrEntity } from '@/modules/pms/product-attr/infrastructure/persistence/relational/entities/product-attr.entity';
import { ProductAttrValueEntity } from '@/modules/pms/product/infrastructure/persistence/relational/entities/product-attr-value.entity';
import { ProductLadderEntity } from '@/modules/pms/product/infrastructure/persistence/relational/entities/product-ladder.entity';
import { ProductFullReductionEntity } from '@/modules/pms/product/infrastructure/persistence/relational/entities/product-full-reduction.entity';
import { ProductCategoryEntity } from '@/modules/pms/product-category/infrastructure/persistence/relational/entities/product-category.entity';
import { CouponEntity } from '@/modules/sms/coupon/infrastructure/persistence/relational/entities/coupon.entity';
import { CouponProductRelationEntity } from '@/modules/sms/coupon/infrastructure/persistence/relational/entities/coupon-product-relation.entity';
import { CouponProductCategoryRelationEntity } from '@/modules/sms/coupon/infrastructure/persistence/relational/entities/coupon-product-category-relation.entity';

import { PortalProductController } from './portal-product.controller';
import { PortalProductService } from './portal-product.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      BrandEntity,
      SkuStockEntity,
      ProductAttrEntity,
      ProductAttrValueEntity,
      ProductLadderEntity,
      ProductFullReductionEntity,
      ProductCategoryEntity,
      CouponEntity,
      CouponProductRelationEntity,
      CouponProductCategoryRelationEntity,
    ]),
  ],
  controllers: [PortalProductController],
  providers: [PortalProductService],
})
export class PortalProductModule {}
