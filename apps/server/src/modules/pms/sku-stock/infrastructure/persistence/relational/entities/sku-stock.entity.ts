import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  Relation,
  VersionColumn,
} from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
// 使用 type-only 导入打破 ProductEntity ↔ SkuStockEntity 循环依赖
// （SWC 编译保留 class 声明有 TDZ，值导入会导致 "Cannot access before initialization"）
import type { ProductEntity } from '../../../../../product/infrastructure/persistence/relational/entities/product.entity';

@Entity('pms_sku_stock')
export class SkuStockEntity extends BaseEntity {
  @ApiProperty({ description: '商品ID', type: 'integer' })
  @Index()
  @Column({ name: 'product_id' })
  productId: number;

  @ApiProperty({ description: 'sku编码' })
  @Column({ name: 'sku_code', length: 64, comment: 'sku编码' })
  skuCode: string;

  @ApiProperty({ description: '价格', type: 'number' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: string;

  @ApiProperty({ type: 'integer', description: '库存' })
  @Column({ default: 0 })
  stock: number;

  @ApiProperty({ type: 'integer', description: '预警库存' })
  @Column({ name: 'low_stock', default: 0, comment: '预警库存' })
  lowStock: number;

  @ApiPropertyOptional({ description: '展示图片' })
  @Column({ nullable: true })
  pic: string;

  @ApiProperty({ type: 'integer', description: '销量' })
  @Column({ default: 0 })
  sale: number;

  @ApiPropertyOptional({ description: '促销价格', type: 'number' })
  @Column({
    name: 'promotion_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  promotionPrice: string | null;

  @ApiProperty({ type: 'integer', description: '锁定库存' })
  @Column({ name: 'lock_stock', default: 0, comment: '锁定库存' })
  lockStock: number;

  @ApiPropertyOptional({ description: '规格数据，JSON格式' })
  @Column({
    name: 'sp_data',
    type: 'text',
    nullable: true,
    comment: '规格数据，JSON格式',
  })
  spData: string;

  @ApiProperty({ type: 'integer', description: '乐观锁版本号' })
  @VersionColumn({ comment: '乐观锁版本号' })
  version: number;

  // ---- Relations ----

  @ManyToOne('ProductEntity', 'skuStocks', {
    createForeignKeyConstraints: false,
    eager: false,
    nullable: true,
  })
  @JoinColumn({ name: 'product_id' })
  product: Relation<ProductEntity>;
}
