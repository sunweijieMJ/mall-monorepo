import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional } from 'class-validator';

/** 移动端 - 生成确认订单 DTO */
export class PortalConfirmOrderDto {
  @ApiPropertyOptional({ description: '购物车条目ID列表', type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  cartIds?: number[];
}
