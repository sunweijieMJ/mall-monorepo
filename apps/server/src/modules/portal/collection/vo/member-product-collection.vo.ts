import { OmitType } from '@nestjs/swagger';
import { MemberProductCollectionNewEntity } from '../infrastructure/persistence/relational/entities/member-product-collection.entity';

/** 商品收藏 VO */
export class MemberProductCollectionVo extends OmitType(
  MemberProductCollectionNewEntity,
  [] as const,
) {}
