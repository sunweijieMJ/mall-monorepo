import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({ description: '分类ID', type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiPropertyOptional({ description: '上级分类ID', type: 'integer' })
  @Column({ name: 'parent_id', nullable: true })
  parentId: number;

  @ApiProperty({ description: '分类名称' })
  @Column({ length: 64 })
  name: string;

  @ApiProperty({ type: 'integer', description: '分类级别：0-1级；1-2级' })
  @Column({ default: 0, comment: '分类级别：0-1级；1-2级' })
  level: number;

  @ApiProperty({ type: 'integer', description: '商品数量' })
  @Column({ name: 'product_count', default: 0 })
  productCount: number;

  @ApiProperty({ description: '商品单位' })
  @Column({ name: 'product_unit', length: 64, default: '' })
  productUnit: string;

  @ApiProperty({ type: 'integer', description: '是否显示在导航栏' })
  @Column({ name: 'nav_status', default: 0, comment: '是否显示在导航栏' })
  navStatus: number;

  @ApiProperty({ description: '显示状态：0-不显示；1-显示' })
  @Column({
    name: 'show_status',
    default: 1,
    comment: '显示状态：0-不显示；1-显示',
  })
  showStatus: number;

  @ApiProperty({ type: 'integer', description: '排序' })
  @Column({ default: 0 })
  sort: number;

  @ApiPropertyOptional({ description: '图标' })
  @Column({ nullable: true })
  icon: string;

  @ApiPropertyOptional({ description: '关键字' })
  @Column({ length: 255, nullable: true })
  keywords: string;

  @ApiPropertyOptional({ description: '描述' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @TreeParent()
  parent: ProductCategoryEntity;

  @TreeChildren()
  children: ProductCategoryEntity[];
}
