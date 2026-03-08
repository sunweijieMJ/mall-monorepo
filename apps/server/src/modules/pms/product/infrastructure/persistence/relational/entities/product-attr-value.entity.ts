import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import type { ProductEntity } from './product.entity';

@Entity('pms_product_attribute_value')
export class ProductAttrValueEntity {
  @ApiProperty({ description: '主键ID', type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiPropertyOptional({ description: '商品ID', type: 'integer' })
  @Index()
  @Column({ name: 'product_id', nullable: true })
  productId: number;

  @ApiPropertyOptional({ description: '商品属性ID', type: 'integer' })
  @Column({ name: 'product_attribute_id', nullable: true })
  productAttributeId: number;

  @ApiPropertyOptional({
    description: '手动添加规格或参数的值，参数单值，规格有多个时以逗号隔开',
  })
  @Column({
    nullable: true,
    comment: '手动添加规格或参数的值，参数单值，规格有多个时以逗号隔开',
  })
  value: string;

  // ---- Relations ----

  @ManyToOne('ProductEntity', 'productAttrValues', {
    createForeignKeyConstraints: false,
    eager: false,
    nullable: true,
  })
  @JoinColumn({ name: 'product_id' })
  product: Relation<ProductEntity>;
}
