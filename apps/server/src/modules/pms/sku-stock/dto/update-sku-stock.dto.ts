import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SkuStockItemDto {
  @ApiPropertyOptional({
    description: 'SKU ID（存在则更新，不存在则新增）',
    type: 'integer',
  })
  @IsInt()
  @IsOptional()
  id?: number;

  @ApiPropertyOptional({ description: '商品 ID', type: 'integer' })
  @IsInt()
  @IsOptional()
  productId?: number;

  @ApiProperty({ description: 'SKU 编码', example: 'SP001_001' })
  @IsString()
  skuCode: string;

  @ApiProperty({ description: '价格', example: 99.99 })
  @IsNumber()
  price: number;

  @ApiProperty({ type: 'integer', description: '库存', example: 100 })
  @IsInt()
  @Min(0)
  stock: number;

  @ApiPropertyOptional({
    type: 'integer',
    description: '预警库存',
    example: 10,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  lowStock?: number;

  @ApiPropertyOptional({ description: 'SKU 图片' })
  @IsString()
  @IsOptional()
  pic?: string;

  @ApiPropertyOptional({ type: 'integer', description: '销量', example: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  sale?: number;

  @ApiPropertyOptional({ description: '促销价格', example: 79.99 })
  @IsNumber()
  @IsOptional()
  promotionPrice?: number;

  @ApiPropertyOptional({ type: 'integer', description: '锁定库存', example: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  lockStock?: number;

  @ApiPropertyOptional({ description: '规格数据（JSON 格式）' })
  @IsString()
  @IsOptional()
  spData?: string;
}

export class BatchUpdateSkuStockDto {
  @ApiProperty({ description: 'SKU 库存列表', type: [SkuStockItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkuStockItemDto)
  stocks: SkuStockItemDto[];
}
