import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ description: '订单 ID', type: 'integer' })
  @IsNumber()
  orderId: number;

  @ApiProperty({
    type: 'integer',
    description: '支付方式: 1=支付宝',
    default: 1,
  })
  @IsNumber()
  @IsOptional()
  payType?: number = 1;
}
