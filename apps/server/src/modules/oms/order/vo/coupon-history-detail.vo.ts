import { ApiProperty } from '@nestjs/swagger';
import { CouponHistoryVo } from '@/modules/sms/coupon/vo/coupon-history.vo';
import { CouponVo } from '@/modules/sms/coupon/vo/coupon.vo';

/** 优惠券领取历史详情（含优惠券信息） */
export class CouponHistoryDetailVo {
  @ApiProperty({ type: () => CouponHistoryVo, description: '领取记录' })
  couponHistory: CouponHistoryVo;

  @ApiProperty({ type: () => CouponVo, description: '优惠券信息' })
  coupon: CouponVo;
}
