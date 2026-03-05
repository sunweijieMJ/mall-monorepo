import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

/** 更新订单设置 DTO */
export class UpdateOrderSettingDto {
  @ApiPropertyOptional({ description: '秒杀订单超时关闭时间(分)' })
  @IsInt()
  @Min(0)
  @IsOptional()
  flashOrderOvertime?: number;

  @ApiPropertyOptional({ description: '正常订单超时时间(分)' })
  @IsInt()
  @Min(0)
  @IsOptional()
  normalOrderOvertime?: number;

  @ApiPropertyOptional({ description: '发货后自动确认收货时间（天）' })
  @IsInt()
  @Min(0)
  @IsOptional()
  confirmOvertime?: number;

  @ApiPropertyOptional({ description: '自动完成交易时间，不能申请售后（天）' })
  @IsInt()
  @Min(0)
  @IsOptional()
  finishOvertime?: number;

  @ApiPropertyOptional({ description: '订单完成后自动好评时间（天）' })
  @IsInt()
  @Min(0)
  @IsOptional()
  commentOvertime?: number;
}
