import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';

@Entity('oms_order_setting')
export class OrderSettingEntity extends BaseEntity {
  @ApiProperty({ type: 'integer', description: '秒杀订单超时关闭时间(分)' })
  @Column({ name: 'flash_order_overtime', comment: '秒杀订单超时关闭时间(分)' })
  flashOrderOvertime: number;

  @ApiProperty({ type: 'integer', description: '正常订单超时时间(分)' })
  @Column({ name: 'normal_order_overtime', comment: '正常订单超时时间(分)' })
  normalOrderOvertime: number;

  @ApiProperty({ type: 'integer', description: '发货后自动确认收货时间（天）' })
  @Column({ name: 'confirm_overtime', comment: '发货后自动确认收货时间（天）' })
  confirmOvertime: number;

  @ApiProperty({
    type: 'integer',
    description: '自动完成交易时间，不能申请售后（天）',
  })
  @Column({
    name: 'finish_overtime',
    comment: '自动完成交易时间，不能申请售后（天）',
  })
  finishOvertime: number;

  @ApiProperty({ type: 'integer', description: '订单完成后自动好评时间（天）' })
  @Column({ name: 'comment_overtime', comment: '订单完成后自动好评时间（天）' })
  commentOvertime: number;
}
