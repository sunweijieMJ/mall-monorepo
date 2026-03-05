import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional } from 'class-validator';

/** 修改费用信息 DTO */
export class AdminOrderMoneyDto {
  @ApiProperty({ description: '运费' })
  @IsNumber()
  freightAmount: number;

  @ApiPropertyOptional({ description: '优惠折扣金额' })
  @IsNumber()
  @IsOptional()
  discountAmount?: number;

  @ApiProperty({ description: '订单当前状态' })
  @IsInt()
  status: number;
}
