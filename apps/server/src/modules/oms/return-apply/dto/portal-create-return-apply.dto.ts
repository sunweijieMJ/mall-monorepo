import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

/** 移动端 - 申请退货 DTO */
export class PortalCreateReturnApplyDto {
  @ApiProperty({ description: '订单ID', type: 'integer' })
  @IsInt()
  @IsNotEmpty()
  orderId: number;

  @ApiProperty({ description: '商品ID', type: 'integer' })
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @ApiPropertyOptional({ description: '退货原因' })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiPropertyOptional({ description: '退货说明' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '凭证图片，逗号分隔' })
  @IsString()
  @IsOptional()
  proofPics?: string;

  @ApiPropertyOptional({ description: '退款金额' })
  @IsNumber()
  @IsOptional()
  returnAmount?: number;

  @ApiPropertyOptional({ description: '退货人姓名' })
  @IsString()
  @IsOptional()
  returnName?: string;

  @ApiPropertyOptional({ description: '退货人电话' })
  @IsString()
  @IsOptional()
  returnPhone?: string;
}
