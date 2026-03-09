import { OmitType } from '@nestjs/swagger';
import { ProductEntity } from '../infrastructure/persistence/relational/entities/product.entity';

/** 商品 VO（排除关联实体字段） */
export class ProductVo extends OmitType(ProductEntity, [
  'brand',
  'productCategory',
  'skuStocks',
  'productAttrValues',
  'productLadders',
  'productFullReductions',
  'memberPrices',
] as const) {}
