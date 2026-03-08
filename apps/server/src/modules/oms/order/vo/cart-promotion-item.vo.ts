import { ApiProperty } from '@nestjs/swagger';

/** 购物车促销条目 VO */
export class CartPromotionItemVo {
  @ApiProperty({ description: '购物车项 ID', type: 'integer' })
  id: number;

  @ApiProperty({ description: '商品 ID', type: 'integer' })
  productId: number;

  @ApiProperty({ description: 'SKU ID', type: 'integer' })
  productSkuId: number;

  @ApiProperty({ description: '商品名称' })
  productName: string;

  @ApiProperty({ description: '商品图片' })
  productPic: string;

  @ApiProperty({ description: '商品属性' })
  productAttr: string;

  @ApiProperty({ description: '品牌' })
  productBrand: string;

  @ApiProperty({ description: '商品编号' })
  productSn: string;

  @ApiProperty({ description: '单价' })
  price: number;

  @ApiProperty({ type: 'integer', description: '数量' })
  quantity: number;

  @ApiProperty({ type: 'integer', description: '商品库存数量' })
  productQuantity: number;

  @ApiProperty({ description: 'SKU 编码' })
  productSkuCode: string;

  @ApiProperty({ description: '商品分类 ID', type: 'integer' })
  productCategoryId: number;

  @ApiProperty({ description: '促销信息' })
  promotionMessage: string;

  @ApiProperty({ description: '优惠金额' })
  reduceAmount: number;

  @ApiProperty({ type: 'integer', description: '实际库存' })
  realStock: number;

  @ApiProperty({ type: 'integer', description: '积分' })
  integration: number;

  @ApiProperty({ type: 'integer', description: '成长值' })
  growth: number;
}
