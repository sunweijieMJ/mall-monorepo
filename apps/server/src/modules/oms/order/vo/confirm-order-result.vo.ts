import { ApiProperty } from '@nestjs/swagger';
import { CartPromotionItemVo } from './cart-promotion-item.vo';
import { CalcAmountVo } from './calc-amount.vo';
import { CouponHistoryDetailVo } from './coupon-history-detail.vo';
import { MemberAddressVo } from '@/modules/portal/member/vo/member-address.vo';
import { IntegrationConsumeSettingVo } from '@/modules/ums/member-level/vo/integration-consume-setting.vo';

/** 确认订单结果 VO */
export class ConfirmOrderResultVo {
  @ApiProperty({
    type: () => [CartPromotionItemVo],
    description: '购物车促销列表',
  })
  cartPromotionItemList: CartPromotionItemVo[];

  @ApiProperty({
    type: () => [MemberAddressVo],
    description: '收货地址列表',
  })
  memberReceiveAddressList: MemberAddressVo[];

  @ApiProperty({
    type: () => [CouponHistoryDetailVo],
    description: '优惠券详情列表',
  })
  couponHistoryDetailList: CouponHistoryDetailVo[];

  @ApiProperty({ type: 'integer', description: '会员积分' })
  memberIntegration: number;

  @ApiProperty({
    type: () => IntegrationConsumeSettingVo,
    description: '积分消费设置',
  })
  integrationConsumeSetting: IntegrationConsumeSettingVo;

  @ApiProperty({ type: () => CalcAmountVo, description: '结算金额' })
  calcAmount: CalcAmountVo;
}
