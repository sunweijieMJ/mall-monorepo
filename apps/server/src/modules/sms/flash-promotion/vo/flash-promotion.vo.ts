import { OmitType } from '@nestjs/swagger';
import { FlashPromotionEntity } from '../infrastructure/persistence/relational/entities/flash-promotion.entity';

export class FlashPromotionVo extends OmitType(
  FlashPromotionEntity,
  [] as const,
) {}
