import { OmitType } from '@nestjs/swagger';
import { FlashSessionEntity } from '../infrastructure/persistence/relational/entities/flash-promotion.entity';

export class FlashSessionVo extends OmitType(FlashSessionEntity, [] as const) {}
