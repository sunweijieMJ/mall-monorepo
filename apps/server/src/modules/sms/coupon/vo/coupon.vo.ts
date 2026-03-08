import { OmitType } from '@nestjs/swagger';
import { CouponEntity } from '../infrastructure/persistence/relational/entities/coupon.entity';

export class CouponVo extends OmitType(CouponEntity, [] as const) {}
