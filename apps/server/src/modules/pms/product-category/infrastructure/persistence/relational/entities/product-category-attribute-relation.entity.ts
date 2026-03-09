import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** 商品分类与属性的筛选关联关系 */
@Entity('pms_product_category_attribute_relation')
export class ProductCategoryAttributeRelationEntity {
  @ApiProperty({ description: '主键ID', type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '商品分类ID', type: 'integer' })
  @Column({ name: 'product_category_id' })
  productCategoryId: number;

  @ApiProperty({ description: '商品属性ID', type: 'integer' })
  @Column({ name: 'product_attribute_id' })
  productAttributeId: number;
}
