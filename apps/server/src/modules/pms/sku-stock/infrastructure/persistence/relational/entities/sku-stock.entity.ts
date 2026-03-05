import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  VersionColumn,
} from 'typeorm';
import { ProductEntity } from '../../../../../product/infrastructure/persistence/relational/entities/product.entity';

@Entity('pms_sku_stock')
export class SkuStockEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'product_id' })
  productId: number;

  @Column({ name: 'sku_code', length: 64, comment: 'sku编码' })
  skuCode: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ default: 0 })
  stock: number;

  @Column({ name: 'low_stock', default: 0, comment: '预警库存' })
  lowStock: number;

  @Column({ nullable: true })
  pic: string;

  @Column({ default: 0 })
  sale: number;

  @Column({
    name: 'promotion_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  promotionPrice: number;

  @Column({ name: 'lock_stock', default: 0, comment: '锁定库存' })
  lockStock: number;

  @Column({
    name: 'sp_data',
    type: 'text',
    nullable: true,
    comment: '规格数据，JSON格式',
  })
  spData: string;

  @VersionColumn({ comment: '乐观锁版本号' })
  version: number;

  // ---- Relations ----

  @ManyToOne(() => ProductEntity, (product) => product.skuStocks, {
    createForeignKeyConstraints: false,
    eager: false,
    nullable: true,
  })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;
}
