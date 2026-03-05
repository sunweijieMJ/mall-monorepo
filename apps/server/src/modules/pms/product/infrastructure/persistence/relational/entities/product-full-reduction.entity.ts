import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductEntity } from './product.entity';

@Entity('pms_product_full_reduction')
export class ProductFullReductionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'product_id', nullable: true })
  productId: number;

  @Column({
    name: 'full_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  fullPrice: number;

  @Column({
    name: 'reduce_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  reducePrice: number;

  // ---- Relations ----

  @ManyToOne(() => ProductEntity, (product) => product.productFullReductions, {
    createForeignKeyConstraints: false,
    eager: false,
    nullable: true,
  })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;
}
