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
  @ApiProperty({ type: ProductVo, description: '商品信息' })
  product: ProductVo;

  @ApiPropertyOptional({
    type: BrandVo,
    nullable: true,
    description: '品牌信息',
  })
  brand: BrandVo | null;

  @ApiProperty({ type: [SkuStockVo], description: 'SKU 库存列表' })
  skuStockList: SkuStockVo[];

  @ApiProperty({
    type: [ProductAttrVo],
    description: '商品属性列表（规格/参数定义）',
  })
  productAttrList: ProductAttrVo[];

  @ApiProperty({ type: [ProductAttrValueVo], description: '商品属性值列表' })
  productAttrValueList: ProductAttrValueVo[];

  @ApiPropertyOptional({ type: [ProductLadderVo], description: '阶梯价格列表' })
  productLadderList?: ProductLadderVo[];

  @ApiPropertyOptional({
    type: [ProductFullReductionVo],
    description: '满减价格列表',
  })
  productFullReductionList?: ProductFullReductionVo[];

  @ApiProperty({ type: [CouponVo], description: '可用优惠券列表' })
  couponList: CouponVo[];
}
