import { OmitType } from '@nestjs/swagger';
import { FlashProductRelationEntity } from '../infrastructure/persistence/relational/entities/flash-promotion.entity';

export class FlashProductRelationVo extends OmitType(
  FlashProductRelationEntity,
  [] as const,
) {}
