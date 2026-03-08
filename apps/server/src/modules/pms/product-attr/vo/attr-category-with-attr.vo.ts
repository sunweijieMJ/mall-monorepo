import { ApiProperty } from '@nestjs/swagger';
import { ProductAttrCategoryVo } from './product-attr-category.vo';
import { ProductAttrVo } from './product-attr.vo';

/** 属性分类（含属性列表）VO */
export class AttrCategoryWithAttrVo extends ProductAttrCategoryVo {
  @ApiProperty({
    type: () => [ProductAttrVo],
    description: '属性列表',
  })
  attributeList: ProductAttrVo[];
}
