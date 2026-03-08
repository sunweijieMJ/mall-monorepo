import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductVo } from '@/modules/pms/product/vo/product.vo';
import { BrandVo } from '@/modules/pms/brand/vo/brand.vo';
import { SkuStockVo } from '@/modules/pms/sku-stock/vo/sku-stock.vo';
import { ProductAttrVo } from '@/modules/pms/product-attr/vo/product-attr.vo';
import { ProductAttrValueVo } from '@/modules/pms/product/vo/product-attr-value.vo';
import { ProductLadderVo } from '@/modules/pms/product/vo/product-ladder.vo';
import { ProductFullReductionVo } from '@/modules/pms/product/vo/product-full-reduction.vo';
import { CouponVo } from '@/modules/sms/coupon/vo/coupon.vo';

/** 移动端商品详情聚合 VO */
export class PortalProductDetailVo {
  @ApiProperty({ type: ProductVo })
  product: ProductVo;

  @ApiPropertyOptional({ type: BrandVo, nullable: true })
  brand: BrandVo | null;

  @ApiProperty({ type: [SkuStockVo] })
  skuStockList: SkuStockVo[];

  @ApiProperty({ type: [ProductAttrVo] })
  productAttrList: ProductAttrVo[];

  @ApiProperty({ type: [ProductAttrValueVo] })
  productAttrValueList: ProductAttrValueVo[];

  @ApiPropertyOptional({ type: [ProductLadderVo] })
  productLadderList?: ProductLadderVo[];

  @ApiPropertyOptional({ type: [ProductFullReductionVo] })
  productFullReductionList?: ProductFullReductionVo[];

  @ApiProperty({ type: [CouponVo] })
  couponList: CouponVo[];
}
