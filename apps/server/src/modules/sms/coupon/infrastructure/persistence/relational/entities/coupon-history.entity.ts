import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sms_coupon_history')
export class CouponHistoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'coupon_id', nullable: true })
  couponId: number;

  @Column({ name: 'member_id', nullable: true })
  memberId: number;

  @Column({ name: 'coupon_code', length: 64, nullable: true })
  couponCode: string;

  @Column({
    name: 'member_nickname',
    length: 64,
    nullable: true,
    comment: '领取人昵称',
  })
  memberNickname: string;

  @Column({
    name: 'get_type',
    nullable: true,
    comment: '获取类型：0->后台赠送；1->主动获取',
  })
  getType: number;

  @Column({
    name: 'create_time',
    type: 'timestamp',
    nullable: true,
  })
  createTime: Date;

  @Column({
    name: 'use_status',
    nullable: true,
    comment: '使用状态：0->未使用；1->已使用；2->已过期',
  })
  useStatus: number;

  @Column({
    name: 'use_time',
    type: 'timestamp',
    nullable: true,
    comment: '使用时间',
  })
  useTime: Date;

  @Column({ name: 'order_id', nullable: true, comment: '订单编号' })
  orderId: number;

  @Column({
    name: 'order_sn',
    length: 100,
    nullable: true,
    comment: '订单号码',
  })
  orderSn: string;
}
