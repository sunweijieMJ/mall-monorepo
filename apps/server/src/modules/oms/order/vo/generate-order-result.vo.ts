import { ApiProperty } from '@nestjs/swagger';
import { OrderVo } from './order.vo';
import { OrderItemVo } from './order-item.vo';

/** 生成订单结果 VO */
export class GenerateOrderResultVo {
  @ApiProperty({ type: () => OrderVo, description: '订单信息' })
  order: OrderVo;

  @ApiProperty({ type: () => [OrderItemVo], description: '订单项列表' })
  orderItemList: OrderItemVo[];
}
