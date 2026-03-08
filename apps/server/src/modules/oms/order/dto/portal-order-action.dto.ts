import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt } from 'class-validator';

/** 订单 ID 操作 DTO（取消/确认收货/删除） */
export class OrderIdDto {
  @ApiProperty({ description: '订单 ID', type: 'integer' })
  @IsInt()
  orderId: number;
}

/** 支付成功 DTO */
export class PaySuccessDto {
  @ApiProperty({
    type: 'integer',
    description: '支付方式：1→支付宝 2→微信',
    enum: [1, 2],
  })
  @IsInt()
  @IsIn([1, 2])
  payType: number;
}
