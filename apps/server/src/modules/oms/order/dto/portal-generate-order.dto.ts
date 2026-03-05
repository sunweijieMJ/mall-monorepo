import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

/** 移动端 - 提交订单 DTO */
export class PortalGenerateOrderDto {
  @ApiPropertyOptional({ description: '购物车条目ID列表', type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  cartIds?: number[];

  @ApiProperty({ description: '收货地址ID' })
  @IsInt()
  @IsNotEmpty()
  memberReceiveAddressId: number;

  @ApiPropertyOptional({ description: '优惠券ID' })
  @IsInt()
  @IsOptional()
  couponId?: number;

  @ApiPropertyOptional({ description: '使用的积分数量' })
  @IsInt()
  @IsOptional()
  useIntegration?: number;

  @ApiProperty({ description: '支付方式：1->支付宝；2->微信' })
  @IsInt()
  payType: number;

  @ApiPropertyOptional({ description: '订单备注' })
  @IsString()
  @IsOptional()
  note?: string;
}
