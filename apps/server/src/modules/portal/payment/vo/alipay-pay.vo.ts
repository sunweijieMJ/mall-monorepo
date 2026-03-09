import { ApiProperty } from '@nestjs/swagger';

/** 支付宝支付响应 */
export class AlipayPayVo {
  @ApiProperty({ description: '支付表单 HTML' })
  payForm: string;
}
