import { OmitType } from '@nestjs/swagger';
import { HomeRecommendSubjectEntity } from '../infrastructure/persistence/relational/entities/home-recommend-subject.entity';

export class HomeRecommendSubjectVo extends OmitType(
  HomeRecommendSubjectEntity,
  [] as const,
) {}
