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
import type { OrderEntity } from './order.entity';

@Entity('oms_order_operate_history')
export class OrderOperateHistoryEntity {
  @ApiProperty({ description: '主键 ID', type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiPropertyOptional({ description: '订单id', type: 'integer' })
  @Index()
  @Column({ name: 'order_id', nullable: true, comment: '订单id' })
  orderId: number;

  @ApiPropertyOptional({ description: '操作人：用户；系统；后台管理员' })
  @Column({
    name: 'operate_man',
    length: 100,
    nullable: true,
    comment: '操作人：用户；系统；后台管理员',
  })
  operateMan: string;

  @ApiPropertyOptional({ description: '操作时间', format: 'date-time' })
  @Column({
    name: 'create_time',
    type: 'timestamp',
    nullable: true,
    comment: '操作时间',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description:
      '订单状态：0->待付款；1->待发货；2->已发货；3->已完成；4->已关闭；5->无效订单',
    type: 'integer',
    enum: [0, 1, 2, 3, 4, 5],
  })
  @Column({
    name: 'order_status',
    nullable: true,
    comment:
      '订单状态：0->待付款；1->待发货；2->已发货；3->已完成；4->已关闭；5->无效订单',
  })
  orderStatus: number;

  @ApiPropertyOptional({ description: '备注' })
  @Column({ length: 500, nullable: true, comment: '备注' })
  note: string;

  // ---- Relations ----

  @ManyToOne('OrderEntity', 'orderOperateHistories', {
    createForeignKeyConstraints: false,
    eager: false,
    nullable: true,
  })
  @JoinColumn({ name: 'order_id' })
  order: Relation<OrderEntity>;
}
