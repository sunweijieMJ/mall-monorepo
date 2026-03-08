import { ApiProperty } from '@nestjs/swagger';
import { CouponVo } from './coupon.vo';
import { CouponProductRelationVo } from './coupon-product-relation.vo';
import { CouponProductCategoryRelationVo } from './coupon-product-category-relation.vo';

/** 优惠券详情 VO */
export class CouponDetailVo extends CouponVo {
  @ApiProperty({
    type: () => [CouponProductRelationVo],
    description: '关联商品列表',
  })
  productRelationList: CouponProductRelationVo[];

  @ApiProperty({
    type: () => [CouponProductCategoryRelationVo],
    description: '关联分类列表',
  })
  productCategoryRelationList: CouponProductCategoryRelationVo[];
}
