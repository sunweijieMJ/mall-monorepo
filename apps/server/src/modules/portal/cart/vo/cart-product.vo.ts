import { ApiProperty, OmitType } from '@nestjs/swagger';
import { ProductVo } from '@/modules/pms/product/vo/product.vo';
import { SkuStockVo } from '@/modules/pms/sku-stock/vo/sku-stock.vo';

/** 购物车商品规格详情 VO（轻量版，排除大文本字段） */
export class CartProductVo extends OmitType(ProductVo, [
  'detailHtml',
  'detailMobileHtml',
  'detailDesc',
  'detailTitle',
  'description',
  'albumPics',
] as const) {
  @ApiProperty({ type: [SkuStockVo], description: 'SKU 库存列表' })
  skuStockList: SkuStockVo[];
}
