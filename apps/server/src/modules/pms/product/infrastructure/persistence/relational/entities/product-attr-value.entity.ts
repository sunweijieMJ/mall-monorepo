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
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'product_id', nullable: true })
  productId: number;

  @Column({ name: 'product_attribute_id', nullable: true })
  productAttributeId: number;

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
