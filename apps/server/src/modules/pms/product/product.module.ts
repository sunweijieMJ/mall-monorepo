import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductEntity } from './infrastructure/persistence/relational/entities/product.entity';
import { ProductAttrValueEntity } from './infrastructure/persistence/relational/entities/product-attr-value.entity';
import { ProductLadderEntity } from './infrastructure/persistence/relational/entities/product-ladder.entity';
import { ProductFullReductionEntity } from './infrastructure/persistence/relational/entities/product-full-reduction.entity';
import { MemberPriceEntity } from './infrastructure/persistence/relational/entities/member-price.entity';
import { ProductVertifyRecordEntity } from './infrastructure/persistence/relational/entities/product-vertify-record.entity';
import { SkuStockEntity } from '@/modules/pms/sku-stock/infrastructure/persistence/relational/entities/sku-stock.entity';
import { SubjectProductRelationEntity } from '@/modules/cms/subject/infrastructure/persistence/relational/entities/subject-product-relation.entity';
import { PrefrenceAreaProductRelationEntity } from '@/modules/cms/prefrence-area/infrastructure/persistence/relational/entities/prefrence-area-product-relation.entity';

import { ProductService } from './product.service';
import { ProductController } from './product.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // 商品主表及子表
      ProductEntity,
      ProductAttrValueEntity,
      ProductLadderEntity,
      ProductFullReductionEntity,
      MemberPriceEntity,
      ProductVertifyRecordEntity,
      // SKU 库存
      SkuStockEntity,
      // CMS 关联表
      SubjectProductRelationEntity,
      PrefrenceAreaProductRelationEntity,
    ]),
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
