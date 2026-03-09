import { OmitType } from '@nestjs/swagger';
import { OrderEntity } from '../infrastructure/persistence/relational/entities/order.entity';

export class OrderVo extends OmitType(OrderEntity, [
  'orderItems',
  'orderOperateHistories',
] as const) {}
