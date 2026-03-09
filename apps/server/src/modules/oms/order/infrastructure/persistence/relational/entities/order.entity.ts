import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderItemEntity } from './order-item.entity';
import { OrderOperateHistoryEntity } from './order-operate-history.entity';

export enum OrderStatus {
  PENDING_PAYMENT = 0, // 待付款
  PAID = 1, // 已付款/待发货
  SHIPPING = 2, // 已发货
  COMPLETED = 3, // 已完成
  CANCELLED = 4, // 已取消
  CLOSED = 5, // 售后关闭
}

@Entity('oms_order')
@Index(['memberId', 'createdAt'])
@Index(['status', 'createdAt'])
export class OrderEntity {
  @ApiProperty({ description: '主键 ID', type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '会员 ID', type: 'integer' })
  @Index()
  @Column({ name: 'member_id' })
  memberId: number;

  @ApiProperty({ description: '会员用户名' })
  @Column({ name: 'member_username', length: 64, default: '' })
  memberUsername: string;

  @ApiPropertyOptional({ description: '优惠券 ID', type: 'integer' })
  @Column({ name: 'coupon_id', nullable: true })
  couponId: number;

  @ApiProperty({ description: '订单号' })
  @Index()
  @Column({ name: 'order_sn', length: 64, unique: true, comment: '订单号' })
  orderSn: string;

  @ApiProperty({ description: '订单总金额', type: 'number' })
  @Column({
    name: 'total_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '订单总金额',
  })
  totalAmount: string;

  @ApiPropertyOptional({ description: '应付金额', type: 'number' })
  @Column({
    name: 'pay_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '应付金额',
  })
  payAmount: string | null;

  @ApiProperty({ description: '运费', type: 'number' })
  @Column({
    name: 'freight_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: '运费',
  })
  freightAmount: string;

  @ApiProperty({ description: '促销优化金额', type: 'number' })
  @Column({
    name: 'promotion_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: '促销优化金额',
  })
  promotionAmount: string;

  @ApiProperty({ description: '优惠券抵扣金额', type: 'number' })
  @Column({
    name: 'coupon_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: '优惠券抵扣金额',
  })
  couponAmount: string;

  @ApiProperty({ description: '积分抵扣金额', type: 'number' })
  @Column({
    name: 'integration_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: '积分抵扣金额',
  })
  integrationAmount: string;

  @ApiProperty({
    description: '支付方式：0->未支付；1->支付宝；2->微信',
    type: 'integer',
    enum: [0, 1, 2],
  })
  @Column({ default: 1, comment: '支付方式：0->未支付；1->支付宝；2->微信' })
  payType: number;

  @ApiProperty({
    description: '订单来源：0->PC订单；1->app订单',
    type: 'integer',
    enum: [0, 1],
  })
  @Column({ default: 1, comment: '订单来源：0->PC订单；1->app订单' })
  sourceType: number;

  @ApiProperty({
    description:
      '订单状态：0-待付款 1-已付款/待发货 2-已发货 3-已完成 4-已取消 5-售后关闭',
    type: 'integer',
    enum: [0, 1, 2, 3, 4, 5],
  })
  @Column({
    type: 'smallint',
    default: OrderStatus.PENDING_PAYMENT,
    comment: '订单状态',
  })
  status: OrderStatus;

  @ApiProperty({
    description: '确认收货状态：0->未确认；1->已确认',
    type: 'integer',
    enum: [0, 1],
  })
  @Column({
    type: 'smallint',
    default: 0,
    comment: '确认收货状态：0->未确认；1->已确认',
  })
  confirmStatus: number;

  @ApiProperty({ description: '收货人姓名' })
  @Column({
    name: 'receiver_name',
    length: 100,
    default: '',
    comment: '收货人姓名',
  })
  receiverName: string;

  @ApiProperty({ description: '收货人手机号' })
  @Column({
    name: 'receiver_phone',
    length: 32,
    default: '',
    comment: '收货人手机号',
  })
  receiverPhone: string;

  @ApiProperty({ description: '邮政编码' })
  @Column({
    name: 'receiver_post_code',
    length: 32,
    default: '',
    comment: '邮政编码',
  })
  receiverPostCode: string;

  @ApiProperty({ description: '省份' })
  @Column({
    name: 'receiver_province',
    length: 32,
    default: '',
    comment: '省份',
  })
  receiverProvince: string;

  @ApiProperty({ description: '城市' })
  @Column({ name: 'receiver_city', length: 32, default: '', comment: '城市' })
  receiverCity: string;

  @ApiProperty({ description: '区' })
  @Column({ name: 'receiver_region', length: 32, default: '', comment: '区' })
  receiverRegion: string;

  @ApiProperty({ description: '详细地址' })
  @Column({
    name: 'receiver_detail_address',
    length: 200,
    default: '',
    comment: '详细地址',
  })
  receiverDetailAddress: string;

  @ApiPropertyOptional({ description: '订单备注' })
  @Column({ type: 'text', nullable: true, comment: '订单备注' })
  note: string;

  @ApiProperty({
    description: '订单类型：0->正常订单；1->秒杀订单',
    type: 'integer',
    enum: [0, 1],
  })
  @Column({
    name: 'order_type',
    default: 0,
    comment: '订单类型：0->正常订单；1->秒杀订单',
  })
  orderType: number;

  @ApiProperty({ type: 'integer', description: '可获得的积分' })
  @Column({ default: 0, comment: '可获得的积分' })
  integration: number;

  @ApiProperty({ type: 'integer', description: '可获得的成长值' })
  @Column({ default: 0, comment: '可获得的成长值' })
  growth: number;

  @ApiPropertyOptional({ description: '下单时使用的积分' })
  @Column({
    name: 'use_integration',
    nullable: true,
    comment: '下单时使用的积分',
  })
  useIntegration: number;

  @ApiPropertyOptional({ description: '自动确认时间（天）' })
  @Column({
    name: 'auto_confirm_day',
    nullable: true,
    comment: '自动确认时间（天）',
  })
  autoConfirmDay: number;

  @ApiProperty({
    description: '删除状态：0->未删除；1->已删除',
    type: 'integer',
    enum: [0, 1],
  })
  @Column({
    name: 'delete_status',
    default: 0,
    comment: '删除状态：0->未删除；1->已删除',
  })
  deleteStatus: number;

  @ApiPropertyOptional({ description: '物流公司（配送方式）' })
  @Column({
    name: 'delivery_company',
    length: 64,
    nullable: true,
    comment: '物流公司（配送方式）',
  })
  deliveryCompany: string;

  @ApiPropertyOptional({ description: '物流单号' })
  @Column({
    name: 'delivery_sn',
    length: 64,
    nullable: true,
    comment: '物流单号',
  })
  deliverySn: string;

  @ApiPropertyOptional({ description: '支付时间', format: 'date-time' })
  @Column({ name: 'payment_time', type: 'timestamp', nullable: true })
  paymentTime: Date;

  @ApiPropertyOptional({ description: '发货时间', format: 'date-time' })
  @Column({ name: 'delivery_time', type: 'timestamp', nullable: true })
  deliveryTime: Date;

  @ApiPropertyOptional({ description: '确认收货时间', format: 'date-time' })
  @Column({ name: 'receive_time', type: 'timestamp', nullable: true })
  receiveTime: Date;

  @ApiPropertyOptional({ description: '评价时间', format: 'date-time' })
  @Column({ name: 'comment_time', type: 'timestamp', nullable: true })
  commentTime: Date;

  @ApiPropertyOptional({ description: '修改时间', format: 'date-time' })
  @Column({ name: 'modify_time', type: 'timestamp', nullable: true })
  modifyTime: Date;

  @ApiProperty({ description: '创建时间', format: 'date-time' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间', format: 'date-time' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // ---- Relations ----

  @OneToMany(() => OrderItemEntity, (item) => item.order)
  orderItems: OrderItemEntity[];

  @OneToMany(() => OrderOperateHistoryEntity, (history) => history.order)
  orderOperateHistories: OrderOperateHistoryEntity[];
}
