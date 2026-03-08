import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CouponHistoryEntity } from './coupon-history.entity';
import { CouponProductRelationEntity } from './coupon-product-relation.entity';
import { CouponProductCategoryRelationEntity } from './coupon-product-category-relation.entity';

@Entity('sms_coupon')
export class CouponEntity {
  @ApiProperty({ description: '主键ID', type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: '优惠券类型：0->全场通用；1->指定分类；2->指定商品',
    type: 'integer',
    enum: [0, 1, 2],
  })
  @Column({
    default: 0,
    comment: '优惠券类型：0->全场通用；1->指定分类；2->指定商品',
  })
  type: number;

  @ApiProperty({ description: '优惠券名称' })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({
    description: '使用平台：0->全部；1->移动；2->PC',
    type: 'integer',
    enum: [0, 1, 2],
  })
  @Column({ default: 0, comment: '使用平台：0->全部；1->移动；2->PC' })
  platform: number;

  @ApiProperty({ type: 'integer', description: '数量' })
  @Column({ default: 0, comment: '数量' })
  count: number;

  @ApiProperty({ description: '金额', type: 'number' })
  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '金额' })
  amount: string;

  @ApiProperty({ type: 'integer', description: '每人限领张数' })
  @Column({ name: 'per_limit', default: 1, comment: '每人限领张数' })
  perLimit: number;

  @ApiProperty({ description: '使用门槛；0表示无门槛', type: 'number' })
  @Column({
    name: 'min_point',
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '使用门槛；0表示无门槛',
  })
  minPoint: string;

  @ApiPropertyOptional({ description: '开始时间' })
  @Column({ name: 'start_time', type: 'timestamp', nullable: true })
  startTime: Date;

  @ApiPropertyOptional({ description: '结束时间' })
  @Column({ name: 'end_time', type: 'timestamp', nullable: true })
  endTime: Date;

  @ApiProperty({
    description: '使用类型：0->全场通用；1->指定分类；2->指定商品',
    type: 'integer',
    enum: [0, 1, 2],
  })
  @Column({
    name: 'use_type',
    default: 0,
    comment: '使用类型：0->全场通用；1->指定分类；2->指定商品',
  })
  useType: number;

  @ApiPropertyOptional({ description: '使用说明' })
  @Column({ type: 'text', nullable: true, comment: '使用说明' })
  note: string;

  @ApiProperty({ type: 'integer', description: '发行数量' })
  @Column({ name: 'publish_count', default: 0, comment: '发行数量' })
  publishCount: number;

  @ApiProperty({ type: 'integer', description: '已使用数量' })
  @Column({ name: 'use_count', default: 0, comment: '已使用数量' })
  useCount: number;

  @ApiProperty({ type: 'integer', description: '领取数量' })
  @Column({ name: 'receive_count', default: 0, comment: '领取数量' })
  receiveCount: number;

  @ApiPropertyOptional({ description: '可以领取的日期' })
  @Column({
    name: 'enable_time',
    type: 'timestamp',
    nullable: true,
    comment: '可以领取的日期',
  })
  enableTime: Date;

  @ApiPropertyOptional({ description: '优惠码' })
  @Column({ length: 64, nullable: true, comment: '优惠码' })
  code: string;

  @ApiProperty({ description: '可领取的会员类型：0->无限制' })
  @Column({
    name: 'member_level',
    default: 0,
    comment: '可领取的会员类型：0->无限制',
  })
  memberLevel: number;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // ---- Relations ----

  @OneToMany(() => CouponHistoryEntity, (history) => history.coupon)
  couponHistories: CouponHistoryEntity[];

  @OneToMany(() => CouponProductRelationEntity, (rel) => rel.coupon)
  couponProductRelations: CouponProductRelationEntity[];

  @OneToMany(() => CouponProductCategoryRelationEntity, (rel) => rel.coupon)
  couponProductCategoryRelations: CouponProductCategoryRelationEntity[];
}
