import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

/** 添加购物车 DTO */
export class AddCartDto {
  @ApiProperty({ description: '商品 ID', type: 'integer' })
  @IsInt()
  productId: number;

  @ApiProperty({ description: 'SKU ID', type: 'integer' })
  @IsInt()
  productSkuId: number;

  @ApiProperty({ type: 'integer', description: '数量' })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ description: '商品名称' })
  @IsOptional()
  @IsString()
  productName?: string;

  @ApiPropertyOptional({ description: '商品图片' })
  @IsOptional()
  @IsString()
  productPic?: string;

  @ApiPropertyOptional({ description: '商品属性' })
  @IsOptional()
  @IsString()
  productAttr?: string;

  @ApiPropertyOptional({ description: '品牌名称' })
  @IsOptional()
  @IsString()
  productBrand?: string;

  @ApiPropertyOptional({ description: '商品货号' })
  @IsOptional()
  @IsString()
  productSn?: string;

  @ApiPropertyOptional({ description: 'SKU 编码' })
  @IsOptional()
  @IsString()
  productSkuCode?: string;
}
