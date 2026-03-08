import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

/** 订单 ID 操作 DTO（取消/确认收货/删除） */
export class OrderIdDto {
  @ApiProperty({ description: '订单 ID', type: 'integer' })
  @IsInt()
  orderId: number;
}

/** 支付成功 DTO */
export class PaySuccessDto {
  @ApiPropertyOptional({
    type: 'integer',
    description: '支付方式：0→未支付 1→支付宝 2→微信',
  })
  @IsOptional()
  @IsInt()
  payType?: number;
}
