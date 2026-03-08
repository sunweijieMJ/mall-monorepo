import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PageQueryDto } from '@/common/dto/page-result.dto';

/** 商品列表查询 DTO */
export class ProductQueryDto extends PageQueryDto {
  @ApiPropertyOptional({ description: '搜索关键字' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: '商品货号' })
  @IsOptional()
  @IsString()
  productSn?: string;

  @ApiPropertyOptional({
    type: 'integer',
    description: '上架状态',
    enum: [0, 1],
  })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => Number(value))
  publishStatus?: number;

  @ApiPropertyOptional({
    type: 'integer',
    description: '审核状态',
    enum: [0, 1],
  })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => Number(value))
  verifyStatus?: number;

  @ApiPropertyOptional({ description: '品牌 ID', type: 'integer' })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => Number(value))
  brandId?: number;

  @ApiPropertyOptional({ description: '商品分类 ID', type: 'integer' })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => Number(value))
  productCategoryId?: number;
}
