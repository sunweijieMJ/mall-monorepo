import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum OrderStatus {
  PENDING_PAYMENT = 0, // 待付款
  PAID = 1, // 已付款/待发货
  SHIPPING = 2, // 已发货
  COMPLETED = 3, // 已完成
  CANCELLED = 4, // 已取消
  CLOSED = 5, // 售后关闭
}

@Entity('oms_order')
export class OrderEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'member_id' })
  memberId: number;

  @Column({ name: 'member_username', length: 64, default: '' })
  memberUsername: string;

  @Column({ name: 'coupon_id', nullable: true })
  couponId: number;

  @Column({ name: 'order_sn', length: 64, unique: true, comment: '订单号' })
  orderSn: string;

  @Column({
    name: 'total_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '订单总金额',
  })
  totalAmount: number;

  @Column({
    name: 'pay_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '应付金额',
  })
  payAmount: number;

  @Column({
    name: 'freight_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: '运费',
  })
  freightAmount: number;

  @Column({
    name: 'promotion_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: '促销优化金额',
  })
  promotionAmount: number;

  @Column({
    name: 'coupon_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: '优惠券抵扣金额',
  })
  couponAmount: number;

  @Column({
    name: 'integration_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: '积分抵扣金额',
  })
  integrationAmount: number;

  @Column({ default: 1, comment: '支付方式：0->未支付；1->支付宝；2->微信' })
  payType: number;

  @Column({ default: 1, comment: '订单来源：0->PC订单；1->app订单' })
  sourceType: number;

  @Column({
    type: 'smallint',
    default: OrderStatus.PENDING_PAYMENT,
    comment: '订单状态',
  })
  status: OrderStatus;

  @Column({
    type: 'smallint',
    default: 0,
    comment: '确认收货状态：0->未确认；1->已确认',
  })
  confirmStatus: number;

  @Column({
    name: 'receiver_name',
    length: 100,
    default: '',
    comment: '收货人姓名',
  })
  receiverName: string;

  @Column({
    name: 'receiver_phone',
    length: 32,
    default: '',
    comment: '收货人手机号',
  })
  receiverPhone: string;

  @Column({
    name: 'receiver_post_code',
    length: 32,
    default: '',
    comment: '邮政编码',
  })
  receiverPostCode: string;

  @Column({
    name: 'receiver_province',
    length: 32,
    default: '',
    comment: '省份',
  })
  receiverProvince: string;

  @Column({ name: 'receiver_city', length: 32, default: '', comment: '城市' })
  receiverCity: string;

  @Column({ name: 'receiver_region', length: 32, default: '', comment: '区' })
  receiverRegion: string;

  @Column({
    name: 'receiver_detail_address',
    length: 200,
    default: '',
    comment: '详细地址',
  })
  receiverDetailAddress: string;

  @Column({ type: 'text', nullable: true, comment: '订单备注' })
  note: string;

  @Column({
    name: 'delete_status',
    default: 0,
    comment: '删除状态：0->未删除；1->已删除',
  })
  deleteStatus: number;

  @Column({ name: 'payment_time', type: 'timestamp', nullable: true })
  paymentTime: Date;

  @Column({ name: 'delivery_time', type: 'timestamp', nullable: true })
  deliveryTime: Date;

  @Column({ name: 'receive_time', type: 'timestamp', nullable: true })
  receiveTime: Date;

  @Column({ name: 'comment_time', type: 'timestamp', nullable: true })
  commentTime: Date;

  @Column({ name: 'modify_time', type: 'timestamp', nullable: true })
  modifyTime: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
