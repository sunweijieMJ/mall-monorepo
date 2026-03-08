import { ApiProperty } from '@nestjs/swagger';
import { FlashSessionEntity } from '../infrastructure/persistence/relational/entities/flash-promotion.entity';

/** 秒杀场次（含商品数量）VO */
export class FlashSessionWithCountVo extends FlashSessionEntity {
  @ApiProperty({ type: 'integer', description: '关联商品数量' })
  productCount: number;
}
