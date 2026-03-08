import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('pms_product_attribute')
export class ProductAttrEntity {
  @ApiProperty({ description: '主键ID', type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '商品属性分类ID', type: 'integer' })
  @Column({ name: 'product_attribute_category_id' })
  productAttributeCategoryId: number;

  @ApiProperty({ description: '属性名称' })
  @Column({ length: 64 })
  name: string;

  @ApiProperty({ description: '属性选择类型：0-唯一；1-单选；2-多选' })
  @Column({
    name: 'select_type',
    default: 0,
    comment: '属性选择类型：0-唯一；1-单选；2-多选',
  })
  selectType: number;

  @ApiProperty({ description: '属性录入方式：0-手工录入；1-从列表中选取' })
  @Column({
    name: 'input_type',
    default: 0,
    comment: '属性录入方式：0-手工录入；1-从列表中选取',
  })
  inputType: number;

  @ApiPropertyOptional({ description: '可选值列表，以逗号隔开' })
  @Column({
    name: 'input_list',
    length: 255,
    nullable: true,
    comment: '可选值列表，以逗号隔开',
  })
  inputList: string;

  @ApiProperty({ type: 'integer', description: '排序' })
  @Column({ default: 0 })
  sort: number;

  @ApiProperty({ description: '分类筛选样式：1-普通；1-颜色' })
  @Column({
    name: 'filter_type',
    default: 0,
    comment: '分类筛选样式：1-普通；1-颜色',
  })
  filterType: number;

  @ApiProperty({
    description: '检索类型；0-不需要进行检索；1-关键字检索；2-范围检索',
  })
  @Column({
    name: 'search_type',
    default: 0,
    comment: '检索类型；0-不需要进行检索；1-关键字检索；2-范围检索',
  })
  searchType: number;

  @ApiProperty({ description: '相同属性产品是否关联；0-不关联；1-关联' })
  @Column({
    name: 'related_status',
    default: 0,
    comment: '相同属性产品是否关联；0-不关联；1-关联',
  })
  relatedStatus: number;

  @ApiProperty({ description: '是否支持手动新增；0-不支持；1-支持' })
  @Column({
    name: 'hand_add_status',
    default: 0,
    comment: '是否支持手动新增；0-不支持；1-支持',
  })
  handAddStatus: number;

  @ApiProperty({ type: 'integer', description: '属性的类型；0-规格；1-参数' })
  @Column({ default: 0, comment: '属性的类型；0-规格；1-参数' })
  type: number;
}

@Entity('pms_product_attribute_category')
export class ProductAttrCategoryEntity {
  @ApiProperty({ description: '主键ID', type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '分类名称' })
  @Column({ length: 64 })
  name: string;

  @ApiProperty({ type: 'integer', description: '属性数量' })
  @Column({ name: 'attribute_count', default: 0 })
  attributeCount: number;

  @ApiProperty({ type: 'integer', description: '参数数量' })
  @Column({ name: 'param_count', default: 0 })
  paramCount: number;
}
