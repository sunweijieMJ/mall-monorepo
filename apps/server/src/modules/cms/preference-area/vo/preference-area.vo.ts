import { OmitType } from '@nestjs/swagger';
import { PreferenceAreaEntity } from '../infrastructure/persistence/relational/entities/preference-area.entity';

export class PreferenceAreaVo extends OmitType(
  PreferenceAreaEntity,
  [] as const,
) {}
