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
  @ApiProperty({ description: '订单ID' })
  @IsInt()
  @IsNotEmpty()
  orderId: number;

  @ApiProperty({ description: '订单编号' })
  @IsString()
  @IsNotEmpty()
  orderSn: string;

  @ApiProperty({ description: '商品ID' })
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @ApiPropertyOptional({ description: '退货原因' })
  @IsString()
  @IsOptional()
  returnReason?: string;

  @ApiPropertyOptional({ description: '退货说明' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '凭证图片，逗号分隔' })
  @IsString()
  @IsOptional()
  proofPics?: string;

  @ApiPropertyOptional({ description: '商品名称' })
  @IsString()
  @IsOptional()
  productName?: string;

  @ApiPropertyOptional({ description: '商品图片' })
  @IsString()
  @IsOptional()
  productPic?: string;

  @ApiPropertyOptional({ description: '商品品牌' })
  @IsString()
  @IsOptional()
  productBrand?: string;

  @ApiPropertyOptional({ description: '商品属性' })
  @IsString()
  @IsOptional()
  productAttr?: string;

  @ApiPropertyOptional({ description: '商品数量' })
  @IsInt()
  @IsOptional()
  productCount?: number;

  @ApiPropertyOptional({ description: '商品单价' })
  @IsNumber()
  @IsOptional()
  productPrice?: number;

  @ApiPropertyOptional({ description: '商品实际支付价格' })
  @IsNumber()
  @IsOptional()
  productRealPrice?: number;

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

  @ApiPropertyOptional({ description: '会员用户名' })
  @IsString()
  @IsOptional()
  memberUsername?: string;
}
