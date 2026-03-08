import { OmitType } from '@nestjs/swagger';
import { MemberReadHistoryNewEntity } from '../infrastructure/persistence/relational/entities/member-read-history.entity';

/** 浏览历史 VO */
export class MemberReadHistoryVo extends OmitType(
  MemberReadHistoryNewEntity,
  [] as const,
) {}
