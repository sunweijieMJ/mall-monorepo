import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';

@Entity('pms_product_category')
@Tree('closure-table')
export class ProductCategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'parent_id', nullable: true })
  parentId: number;

  @Column({ length: 64 })
  name: string;

  @Column({ default: 0, comment: '分类级别：0-1级；1-2级' })
  level: number;

  @Column({ name: 'product_count', default: 0 })
  productCount: number;

  @Column({ name: 'product_unit', length: 64, default: '' })
  productUnit: string;

  @Column({ name: 'nav_status', default: 0, comment: '是否显示在导航栏' })
  navStatus: number;

  @Column({
    name: 'show_status',
    default: 1,
    comment: '显示状态：0-不显示；1-显示',
  })
  showStatus: number;

  @Column({ default: 0 })
  sort: number;

  @Column({ nullable: true })
  icon: string;

  @Column({ length: 255, nullable: true })
  keywords: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @TreeParent()
  parent: ProductCategoryEntity;

  @TreeChildren()
  children: ProductCategoryEntity[];
}
