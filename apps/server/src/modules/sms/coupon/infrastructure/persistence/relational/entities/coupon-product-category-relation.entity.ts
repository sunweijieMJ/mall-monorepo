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

@Entity('sms_coupon_product_category_relation')
export class CouponProductCategoryRelationEntity {
  @ApiProperty({ description: '主键ID', type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiPropertyOptional({ description: '优惠券ID', type: 'integer' })
  @Column({ name: 'coupon_id', nullable: true })
  couponId: number;

  @ApiPropertyOptional({ description: '商品分类ID', type: 'integer' })
  @Column({ name: 'product_category_id', nullable: true })
  productCategoryId: number;

  @ApiPropertyOptional({ description: '产品分类名称' })
  @Column({
    name: 'product_category_name',
    length: 200,
    nullable: true,
    comment: '产品分类名称',
  })
  productCategoryName: string;

  @ApiPropertyOptional({ description: '父分类名称' })
  @Column({
    name: 'parent_category_name',
    length: 200,
    nullable: true,
    comment: '父分类名称',
  })
  parentCategoryName: string;

  // ---- Relations ----

  @ManyToOne('CouponEntity', 'couponProductCategoryRelations', {
    createForeignKeyConstraints: false,
    eager: false,
    nullable: true,
  })
  @JoinColumn({ name: 'coupon_id' })
  coupon: Relation<CouponEntity>;
}
