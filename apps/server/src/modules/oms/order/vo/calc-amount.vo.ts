import { ApiProperty } from '@nestjs/swagger';

/** 结算金额 VO */
export class CalcAmountVo {
  @ApiProperty({ description: '运费' })
  freightAmount: number;

  @ApiProperty({ description: '总金额' })
  totalAmount: number;

  @ApiProperty({ description: '促销优惠金额' })
  promotionAmount: number;

  @ApiProperty({ description: '应付金额' })
  payAmount: number;
}
