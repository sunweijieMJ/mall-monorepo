import { ApiProperty } from '@nestjs/swagger';
import { ProductVo } from '@/modules/pms/product/vo/product.vo';
import { SkuStockVo } from '@/modules/pms/sku-stock/vo/sku-stock.vo';

/** 购物车商品规格详情 VO */
export class CartProductVo extends ProductVo {
  @ApiProperty({ type: [SkuStockVo], description: 'SKU 库存列表' })
  skuStockList: SkuStockVo[];
}
