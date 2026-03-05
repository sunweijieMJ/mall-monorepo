import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

// ---- 首页广告 DTO ----

export class CreateHomeAdvertiseDto {
  @ApiProperty({ description: '广告名称', example: '双11大促' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: '轮播位置：0-PC首页轮播 1-app首页轮播',
    example: 0,
  })
  @IsInt()
  @IsOptional()
  type?: number;

  @ApiPropertyOptional({ description: '图片地址' })
  @IsString()
  @IsOptional()
  pic?: string;

  @ApiPropertyOptional({ description: '开始时间' })
  @Type(() => Date)
  @IsOptional()
  startTime?: Date;

  @ApiPropertyOptional({ description: '结束时间' })
  @Type(() => Date)
  @IsOptional()
  endTime?: Date;

  @ApiPropertyOptional({
    description: '上下线状态：0-下线 1-上线',
    example: 0,
  })
  @IsInt()
  @IsOptional()
  status?: number;

  @ApiPropertyOptional({ description: '链接地址' })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiPropertyOptional({ description: '排序', example: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  sort?: number;
}

export class UpdateHomeAdvertiseDto extends PartialType(
  CreateHomeAdvertiseDto,
) {}

// ---- 批量删除 DTO ----

export class BatchDeleteDto {
  @ApiProperty({ description: 'ID 数组', type: [Number] })
  @IsArray()
  @IsInt({ each: true })
  ids: number[];
}

// ---- 首页品牌推荐 DTO ----

export class CreateHomeBrandDto {
  @ApiProperty({ description: '品牌 ID' })
  @IsInt()
  brandId: number;

  @ApiProperty({ description: '品牌名称', example: 'Apple' })
  @IsString()
  @IsNotEmpty()
  brandName: string;

  @ApiPropertyOptional({
    description: '推荐状态：0-不推荐 1-推荐',
    example: 1,
  })
  @IsInt()
  @IsOptional()
  recommendStatus?: number;

  @ApiPropertyOptional({ description: '排序', example: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  sort?: number;
}

// ---- 首页推荐专题 DTO ----

export class CreateHomeSubjectDto {
  @ApiProperty({ description: '专题 ID' })
  @IsInt()
  subjectId: number;

  @ApiProperty({ description: '专题名称', example: '夏季穿搭' })
  @IsString()
  @IsNotEmpty()
  subjectName: string;

  @ApiPropertyOptional({
    description: '推荐状态：0-不推荐 1-推荐',
    example: 1,
  })
  @IsInt()
  @IsOptional()
  recommendStatus?: number;

  @ApiPropertyOptional({ description: '排序', example: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  sort?: number;
}

// ---- 新品推荐 DTO ----

export class CreateHomeNewProductDto {
  @ApiProperty({ description: '商品 ID' })
  @IsInt()
  productId: number;

  @ApiProperty({ description: '商品名称', example: '新款手机' })
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiPropertyOptional({
    description: '推荐状态：0-不推荐 1-推荐',
    example: 1,
  })
  @IsInt()
  @IsOptional()
  recommendStatus?: number;

  @ApiPropertyOptional({ description: '排序', example: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  sort?: number;
}

// ---- 人气推荐 DTO ----

export class CreateHomeRecommendProductDto {
  @ApiProperty({ description: '商品 ID' })
  @IsInt()
  productId: number;

  @ApiProperty({ description: '商品名称', example: '热销手机' })
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiPropertyOptional({
    description: '推荐状态：0-不推荐 1-推荐',
    example: 1,
  })
  @IsInt()
  @IsOptional()
  recommendStatus?: number;

  @ApiPropertyOptional({ description: '排序', example: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  sort?: number;
}
