import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderEntity } from './order.entity';

@Entity('oms_order_operate_history')
export class OrderOperateHistoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'order_id', nullable: true, comment: '订单id' })
  orderId: number;

  @Column({
    name: 'operate_man',
    length: 100,
    nullable: true,
    comment: '操作人：用户；系统；后台管理员',
  })
  operateMan: string;

  @Column({
    name: 'create_time',
    type: 'timestamp',
    nullable: true,
    comment: '操作时间',
  })
  createTime: Date;

  @Column({
    name: 'order_status',
    nullable: true,
    comment:
      '订单状态：0->待付款；1->待发货；2->已发货；3->已完成；4->已关闭；5->无效订单',
  })
  orderStatus: number;

  @Column({ length: 500, nullable: true, comment: '备注' })
  note: string;

  // ---- Relations ----

  @ManyToOne(() => OrderEntity, (order) => order.orderOperateHistories, {
    createForeignKeyConstraints: false,
    eager: false,
    nullable: true,
  })
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;
}
