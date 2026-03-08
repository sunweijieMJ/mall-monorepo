import { OmitType } from '@nestjs/swagger';
import { CartItemEntity } from '../infrastructure/persistence/relational/entities/cart-item.entity';

/** 购物车条目 VO */
export class CartItemVo extends OmitType(CartItemEntity, [] as const) {}
