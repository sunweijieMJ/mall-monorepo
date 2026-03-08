import { ApiProperty } from '@nestjs/swagger';
import { OrderVo } from './order.vo';
import { OrderItemVo } from './order-item.vo';
import { OrderOperateHistoryVo } from './order-operate-history.vo';

/** 订单详情 VO（含订单项和操作历史） */
export class OrderDetailVo extends OrderVo {
  @ApiProperty({ type: () => [OrderItemVo], description: '订单项列表' })
  orderItemList: OrderItemVo[];

  @ApiProperty({
    type: () => [OrderOperateHistoryVo],
    description: '操作历史',
  })
  historyList: OrderOperateHistoryVo[];
}
