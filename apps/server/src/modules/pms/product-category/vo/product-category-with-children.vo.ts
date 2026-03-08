import { ApiProperty } from '@nestjs/swagger';
import { ProductCategoryVo } from './product-category.vo';

/** 商品分类（含子分类）VO */
export class ProductCategoryWithChildrenVo extends ProductCategoryVo {
  @ApiProperty({
    type: () => [ProductCategoryVo],
    description: '子分类列表',
  })
  children: ProductCategoryVo[];
}
