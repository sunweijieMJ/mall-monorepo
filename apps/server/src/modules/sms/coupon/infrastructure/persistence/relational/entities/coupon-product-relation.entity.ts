import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import type { CouponEntity } from './coupon.entity';

@Entity('sms_coupon_product_relation')
export class CouponProductRelationEntity {
  @ApiProperty({ description: '主键ID', type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiPropertyOptional({ description: '优惠券ID', type: 'integer' })
  @Column({ name: 'coupon_id', nullable: true })
  couponId: number;

  @ApiPropertyOptional({ description: '商品ID', type: 'integer' })
  @Column({ name: 'product_id', nullable: true })
  productId: number;

  @ApiPropertyOptional({ description: '商品名称' })
  @Column({
    name: 'product_name',
    length: 200,
    nullable: true,
    comment: '商品名称',
  })
  productName: string;

  @ApiPropertyOptional({ description: '商品编码' })
  @Column({
    name: 'product_sn',
    length: 64,
    nullable: true,
    comment: '商品编码',
  })
  productSn: string;

  // ---- Relations ----

  @ManyToOne('CouponEntity', 'couponProductRelations', {
    createForeignKeyConstraints: false,
    eager: false,
    nullable: true,
  })
  @JoinColumn({ name: 'coupon_id' })
  coupon: Relation<CouponEntity>;
}
