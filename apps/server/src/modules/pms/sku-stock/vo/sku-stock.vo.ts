import { OmitType } from '@nestjs/swagger';
import { SkuStockEntity } from '../infrastructure/persistence/relational/entities/sku-stock.entity';

/** SKU 库存 VO — 排除内部字段（乐观锁版本号、锁定库存、关联实体） */
export class SkuStockVo extends OmitType(SkuStockEntity, [
  'version',
  'lockStock',
  'product',
] as const) {}
