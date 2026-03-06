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

@Entity('pms_product_ladder')
export class ProductLadderEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'product_id', nullable: true })
  productId: number;

  @Column({ nullable: true, comment: '满足的商品数量' })
  count: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '折扣',
  })
  discount: string | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '折后价格',
  })
  price: string | null;

  // ---- Relations ----

  @ManyToOne('ProductEntity', 'productLadders', {
    createForeignKeyConstraints: false,
    eager: false,
    nullable: true,
  })
  @JoinColumn({ name: 'product_id' })
  product: Relation<ProductEntity>;
}
