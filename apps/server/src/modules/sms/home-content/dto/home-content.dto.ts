import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsIn,
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
    type: 'integer',
    description: '轮播位置：0-PC首页轮播 1-app首页轮播',
    enum: [0, 1],
    example: 0,
  })
  @IsIn([0, 1])
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
    type: 'integer',
    description: '上下线状态：0-下线 1-上线',
    enum: [0, 1],
    example: 0,
  })
  @IsIn([0, 1])
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

  @ApiPropertyOptional({ type: 'integer', description: '排序', example: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  sort?: number;
}

export class UpdateHomeAdvertiseDto extends PartialType(
  CreateHomeAdvertiseDto,
) {}

// ---- 首页品牌推荐 DTO ----

export class CreateHomeBrandDto {
  @ApiProperty({ description: '品牌 ID', type: 'integer' })
  @IsInt()
  brandId: number;

  @ApiProperty({ description: '品牌名称', example: 'Apple' })
  @IsString()
  @IsNotEmpty()
  brandName: string;

  @ApiPropertyOptional({
    type: 'integer',
    description: '推荐状态：0-不推荐 1-推荐',
    example: 1,
  })
  @IsInt()
  @IsOptional()
  recommendStatus?: number;

  @ApiPropertyOptional({ type: 'integer', description: '排序', example: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  sort?: number;
}

// ---- 首页推荐专题 DTO ----

export class CreateHomeSubjectDto {
  @ApiProperty({ description: '专题 ID', type: 'integer' })
  @IsInt()
  subjectId: number;

  @ApiProperty({ description: '专题名称', example: '夏季穿搭' })
  @IsString()
  @IsNotEmpty()
  subjectName: string;

  @ApiPropertyOptional({
    type: 'integer',
    description: '推荐状态：0-不推荐 1-推荐',
    example: 1,
  })
  @IsInt()
  @IsOptional()
  recommendStatus?: number;

  @ApiPropertyOptional({ type: 'integer', description: '排序', example: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  sort?: number;
}

// ---- 新品推荐 DTO ----

export class CreateHomeNewProductDto {
  @ApiProperty({ description: '商品 ID', type: 'integer' })
  @IsInt()
  productId: number;

  @ApiProperty({ description: '商品名称', example: '新款手机' })
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiPropertyOptional({
    type: 'integer',
    description: '推荐状态：0-不推荐 1-推荐',
    example: 1,
  })
  @IsInt()
  @IsOptional()
  recommendStatus?: number;

  @ApiPropertyOptional({ type: 'integer', description: '排序', example: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  sort?: number;
}

// ---- 人气推荐 DTO ----

export class CreateHomeRecommendProductDto {
  @ApiProperty({ description: '商品 ID', type: 'integer' })
  @IsInt()
  productId: number;

  @ApiProperty({ description: '商品名称', example: '热销手机' })
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiPropertyOptional({
    type: 'integer',
    description: '推荐状态：0-不推荐 1-推荐',
    example: 1,
  })
  @IsInt()
  @IsOptional()
  recommendStatus?: number;

  @ApiPropertyOptional({ type: 'integer', description: '排序', example: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  sort?: number;
}
