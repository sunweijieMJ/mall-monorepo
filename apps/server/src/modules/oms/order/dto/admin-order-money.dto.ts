import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsNumber, IsOptional } from 'class-validator';

/** 修改费用信息 DTO */
export class AdminOrderMoneyDto {
  @ApiProperty({ description: '运费' })
  @IsNumber()
  freightAmount: number;

  @ApiPropertyOptional({ description: '优惠折扣金额' })
  @IsNumber()
  @IsOptional()
  discountAmount?: number;

  @ApiProperty({
    type: 'integer',
    description:
      '订单当前状态：0-待付款 1-待发货 2-已发货 3-已完成 4-已关闭 5-无效订单',
    enum: [0, 1, 2, 3, 4, 5],
  })
  @IsInt()
  @IsIn([0, 1, 2, 3, 4, 5])
  status: number;
}
