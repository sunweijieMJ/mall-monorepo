import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

/** 单条发货信息 */
export class AdminOrderDeliveryDto {
  @ApiProperty({ description: '订单ID' })
  @IsNumber()
  @IsNotEmpty()
  orderId: number;

  @ApiProperty({ description: '物流公司', example: '顺丰速运' })
  @IsString()
  @IsNotEmpty()
  deliveryCompany: string;

  @ApiProperty({ description: '物流单号', example: 'SF1234567890' })
  @IsString()
  @IsNotEmpty()
  deliverySn: string;
}
