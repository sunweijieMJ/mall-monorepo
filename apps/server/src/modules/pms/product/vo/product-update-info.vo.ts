import { ApiProperty } from '@nestjs/swagger';
import { ProductVo } from './product.vo';
import { SkuStockVo } from '@/modules/pms/sku-stock/vo/sku-stock.vo';
import { ProductAttrValueVo } from './product-attr-value.vo';
import { ProductLadderVo } from './product-ladder.vo';
import { ProductFullReductionVo } from './product-full-reduction.vo';
import { MemberPriceVo } from './member-price.vo';
import { SubjectProductRelationVo } from '@/modules/cms/subject/vo/subject-product-relation.vo';
import { PreferenceAreaProductRelationVo } from '@/modules/cms/preference-area/vo/preference-area-product-relation.vo';

/** 商品编辑信息 VO（含所有关联列表） */
export class ProductUpdateInfoVo extends ProductVo {
  @ApiProperty({ type: () => [SkuStockVo], description: 'SKU 库存列表' })
  skuStockList: SkuStockVo[];

  @ApiProperty({
    type: () => [ProductAttrValueVo],
    description: '商品属性值列表',
  })
  productAttributeValueList: ProductAttrValueVo[];

  @ApiProperty({
    type: () => [ProductLadderVo],
    description: '阶梯价格列表',
  })
  productLadderList: ProductLadderVo[];

  @ApiProperty({
    type: () => [ProductFullReductionVo],
    description: '满减列表',
  })
  productFullReductionList: ProductFullReductionVo[];

  @ApiProperty({
    type: () => [MemberPriceVo],
    description: '会员价格列表',
  })
  memberPriceList: MemberPriceVo[];

  @ApiProperty({
    type: () => [SubjectProductRelationVo],
    description: '关联专题列表',
  })
  subjectProductRelationList: SubjectProductRelationVo[];

  @ApiProperty({
    type: () => [PreferenceAreaProductRelationVo],
    description: '关联优选区域列表',
  })
  preferenceAreaProductRelationList: PreferenceAreaProductRelationVo[];
}
