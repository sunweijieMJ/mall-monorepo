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

@Entity('pms_product_ladder')
export class ProductLadderEntity {
  @ApiProperty({ description: '主键ID', type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiPropertyOptional({ description: '商品ID', type: 'integer' })
  @Index()
  @Column({ name: 'product_id', nullable: true })
  productId: number;

  @ApiPropertyOptional({ type: 'integer', description: '满足的商品数量' })
  @Column({ nullable: true, comment: '满足的商品数量' })
  count: number;

  @ApiPropertyOptional({ description: '折扣', type: 'number' })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '折扣',
  })
  discount: string | null;

  @ApiPropertyOptional({ description: '折后价格', type: 'number' })
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
