import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('pms_product_attribute')
export class ProductAttrEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_attribute_category_id' })
  productAttributeCategoryId: number;

  @Column({ length: 64 })
  name: string;

  @Column({
    name: 'select_type',
    default: 0,
    comment: '属性选择类型：0-唯一；1-单选；2-多选',
  })
  selectType: number;

  @Column({
    name: 'input_type',
    default: 0,
    comment: '属性录入方式：0-手工录入；1-从列表中选取',
  })
  inputType: number;

  @Column({
    name: 'input_list',
    length: 255,
    nullable: true,
    comment: '可选值列表，以逗号隔开',
  })
  inputList: string;

  @Column({ default: 0 })
  sort: number;

  @Column({
    name: 'filter_type',
    default: 0,
    comment: '分类筛选样式：1-普通；1-颜色',
  })
  filterType: number;

  @Column({
    name: 'search_type',
    default: 0,
    comment: '检索类型；0-不需要进行检索；1-关键字检索；2-范围检索',
  })
  searchType: number;

  @Column({
    name: 'related_status',
    default: 0,
    comment: '相同属性产品是否关联；0-不关联；1-关联',
  })
  relatedStatus: number;

  @Column({
    name: 'hand_add_status',
    default: 0,
    comment: '是否支持手动新增；0-不支持；1-支持',
  })
  handAddStatus: number;

  @Column({ default: 0, comment: '属性的类型；0-规格；1-参数' })
  type: number;
}

@Entity('pms_product_attribute_category')
export class ProductAttrCategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 64 })
  name: string;

  @Column({ name: 'attribute_count', default: 0 })
  attributeCount: number;

  @Column({ name: 'param_count', default: 0 })
  paramCount: number;
}
