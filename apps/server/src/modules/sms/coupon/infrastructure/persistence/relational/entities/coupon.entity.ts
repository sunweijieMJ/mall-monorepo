import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('sms_coupon')
export class CouponEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    default: 0,
    comment: '优惠券类型：0->全场通用；1->指定分类；2->指定商品',
  })
  type: number;

  @Column({ length: 100 })
  name: string;

  @Column({ default: 0, comment: '使用平台：0->全部；1->移动；2->PC' })
  platform: number;

  @Column({ default: 0, comment: '数量' })
  count: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '金额' })
  amount: number;

  @Column({ name: 'per_limit', default: 1, comment: '每人限领张数' })
  perLimit: number;

  @Column({
    name: 'min_point',
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '使用门槛；0表示无门槛',
  })
  minPoint: number;

  @Column({ name: 'start_time', type: 'timestamp', nullable: true })
  startTime: Date;

  @Column({ name: 'end_time', type: 'timestamp', nullable: true })
  endTime: Date;

  @Column({
    name: 'use_type',
    default: 0,
    comment: '使用类型：0->全场通用；1->指定分类；2->指定商品',
  })
  useType: number;

  @Column({ type: 'text', nullable: true, comment: '使用说明' })
  note: string;

  @Column({ name: 'publish_count', default: 0, comment: '发行数量' })
  publishCount: number;

  @Column({ name: 'use_count', default: 0, comment: '已使用数量' })
  useCount: number;

  @Column({ name: 'receive_count', default: 0, comment: '领取数量' })
  receiveCount: number;

  @Column({
    name: 'enable_time',
    type: 'timestamp',
    nullable: true,
    comment: '可以领取的日期',
  })
  enableTime: Date;

  @Column({ length: 64, nullable: true, comment: '优惠码' })
  code: string;

  @Column({
    name: 'member_level',
    default: 0,
    comment: '可领取的会员类型：0->无限制',
  })
  memberLevel: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
