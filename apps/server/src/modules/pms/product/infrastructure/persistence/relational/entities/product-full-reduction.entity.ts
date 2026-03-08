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

@Entity('pms_product_full_reduction')
export class ProductFullReductionEntity {
  @ApiProperty({ description: '主键ID', type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiPropertyOptional({ description: '商品ID', type: 'integer' })
  @Index()
  @Column({ name: 'product_id', nullable: true })
  productId: number;

  @ApiPropertyOptional({ description: '满减金额', type: 'number' })
  @Column({
    name: 'full_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  fullPrice: string | null;

  @ApiPropertyOptional({ description: '减免金额', type: 'number' })
  @Column({
    name: 'reduce_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  reducePrice: string | null;

  // ---- Relations ----

  @ManyToOne('ProductEntity', 'productFullReductions', {
    createForeignKeyConstraints: false,
    eager: false,
    nullable: true,
  })
  @JoinColumn({ name: 'product_id' })
  product: Relation<ProductEntity>;
}
