import { OmitType } from '@nestjs/swagger';
import { CouponHistoryEntity } from '../infrastructure/persistence/relational/entities/coupon-history.entity';

export class CouponHistoryVo extends OmitType(
  CouponHistoryEntity,
  [] as const,
) {}
