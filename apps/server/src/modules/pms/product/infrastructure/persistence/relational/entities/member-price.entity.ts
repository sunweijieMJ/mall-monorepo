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

@Entity('pms_member_price')
export class MemberPriceEntity {
  @ApiProperty({ description: '主键ID', type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiPropertyOptional({ description: '商品ID', type: 'integer' })
  @Index()
  @Column({ name: 'product_id', nullable: true })
  productId: number;

  @ApiPropertyOptional({ description: '会员等级ID', type: 'integer' })
  @Column({ name: 'member_level_id', nullable: true })
  memberLevelId: number;

  @ApiPropertyOptional({ description: '会员价格', type: 'number' })
  @Column({
    name: 'member_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '会员价格',
  })
  memberPrice: string | null;

  @ApiPropertyOptional({ description: '会员等级名称' })
  @Column({ name: 'member_level_name', length: 100, nullable: true })
  memberLevelName: string;

  // ---- Relations ----

  @ManyToOne('ProductEntity', 'memberPrices', {
    createForeignKeyConstraints: false,
    eager: false,
    nullable: true,
  })
  @JoinColumn({ name: 'product_id' })
  product: Relation<ProductEntity>;
}
