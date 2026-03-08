import { OmitType } from '@nestjs/swagger';
import { OrderItemEntity } from '../infrastructure/persistence/relational/entities/order-item.entity';

export class OrderItemVo extends OmitType(OrderItemEntity, [] as const) {}
