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
import type { CouponEntity } from './coupon.entity';

@Entity('sms_coupon_history')
export class CouponHistoryEntity {
  @ApiProperty({ description: '主键ID', type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiPropertyOptional({ description: '优惠券ID', type: 'integer' })
  @Index()
  @Column({ name: 'coupon_id', nullable: true })
  couponId: number;

  @ApiPropertyOptional({ description: '会员ID', type: 'integer' })
  @Index()
  @Column({ name: 'member_id', nullable: true })
  memberId: number;

  @ApiPropertyOptional({ description: '优惠码' })
  @Column({ name: 'coupon_code', length: 64, nullable: true })
  couponCode: string;

  @ApiPropertyOptional({ description: '领取人昵称' })
  @Column({
    name: 'member_nickname',
    length: 64,
    nullable: true,
    comment: '领取人昵称',
  })
  memberNickname: string;

  @ApiPropertyOptional({
    description: '获取类型：0->后台赠送；1->主动获取',
    type: 'integer',
    enum: [0, 1],
  })
  @Column({
    name: 'get_type',
    nullable: true,
    comment: '获取类型：0->后台赠送；1->主动获取',
  })
  getType: number;

  @ApiPropertyOptional({ description: '创建时间' })
  @Column({
    name: 'create_time',
    type: 'timestamp',
    nullable: true,
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: '使用状态：0->未使用；1->已使用；2->已过期',
    type: 'integer',
    enum: [0, 1, 2],
  })
  @Column({
    name: 'use_status',
    nullable: true,
    comment: '使用状态：0->未使用；1->已使用；2->已过期',
  })
  useStatus: number;

  @ApiPropertyOptional({ description: '使用时间' })
  @Column({
    name: 'use_time',
    type: 'timestamp',
    nullable: true,
    comment: '使用时间',
  })
  useTime: Date;

  @ApiPropertyOptional({ description: '订单编号', type: 'integer' })
  @Column({ name: 'order_id', nullable: true, comment: '订单编号' })
  orderId: number;

  @ApiPropertyOptional({ description: '订单号码' })
  @Column({
    name: 'order_sn',
    length: 100,
    nullable: true,
    comment: '订单号码',
  })
  orderSn: string;

  // ---- Relations ----

  @ManyToOne('CouponEntity', 'couponHistories', {
    createForeignKeyConstraints: false,
    eager: false,
    nullable: true,
  })
  @JoinColumn({ name: 'coupon_id' })
  coupon: Relation<CouponEntity>;
}
