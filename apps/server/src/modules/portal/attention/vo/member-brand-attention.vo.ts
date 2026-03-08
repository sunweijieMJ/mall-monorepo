import { OmitType } from '@nestjs/swagger';
import { MemberBrandAttentionNewEntity } from '../infrastructure/persistence/relational/entities/member-brand-attention.entity';

/** 品牌关注 VO */
export class MemberBrandAttentionVo extends OmitType(
  MemberBrandAttentionNewEntity,
  [] as const,
) {}
