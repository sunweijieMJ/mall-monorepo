import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/** 优惠券关联商品 */
export class CouponProductRelationDto {
  @ApiProperty({ description: '商品 ID', type: 'integer' })
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @ApiPropertyOptional({ description: '商品名称' })
  @IsString()
  @IsOptional()
  productName?: string;

  @ApiPropertyOptional({ description: '商品编码' })
  @IsString()
  @IsOptional()
  productSn?: string;
}

/** 优惠券关联分类 */
export class CouponProductCategoryRelationDto {
  @ApiProperty({ description: '商品分类 ID', type: 'integer' })
  @IsInt()
  @IsNotEmpty()
  productCategoryId: number;

  @ApiPropertyOptional({ description: '商品分类名称' })
  @IsString()
  @IsOptional()
  productCategoryName?: string;

  @ApiPropertyOptional({ description: '父分类名称' })
  @IsString()
  @IsOptional()
  parentCategoryName?: string;
}

export class CreateCouponDto {
  @ApiProperty({
    type: 'integer',
    description: '优惠券类型：0-全场通用 1-指定分类 2-指定商品',
    enum: [0, 1, 2],
    example: 0,
  })
  @IsIn([0, 1, 2])
  type: number;

  @ApiProperty({ description: '优惠券名称', example: '新人专享券' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    type: 'integer',
    description: '使用平台：0-全部 1-移动 2-PC',
    enum: [0, 1, 2],
    example: 0,
  })
  @IsIn([0, 1, 2])
  @IsOptional()
  platform?: number;

  @ApiProperty({ description: '优惠金额', example: 10.0 })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({
    type: 'integer',
    description: '每人限领张数',
    example: 1,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  perLimit?: number;

  @ApiPropertyOptional({ description: '使用门槛；0 表示无门槛', example: 0 })
  @IsNumber()
  @IsOptional()
  minPoint?: number;

  @ApiPropertyOptional({ description: '开始时间', format: 'date-time' })
  @Type(() => Date)
  @IsOptional()
  startTime?: Date;

  @ApiPropertyOptional({ description: '结束时间', format: 'date-time' })
  @Type(() => Date)
  @IsOptional()
  endTime?: Date;

  @ApiPropertyOptional({
    type: 'integer',
    description: '使用类型：0-全场通用 1-指定分类 2-指定商品',
    enum: [0, 1, 2],
    example: 0,
  })
  @IsIn([0, 1, 2])
  @IsOptional()
  useType?: number;

  @ApiPropertyOptional({ description: '使用说明' })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiPropertyOptional({
    type: 'integer',
    description: '发行数量',
    example: 100,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  publishCount?: number;

  @ApiPropertyOptional({ description: '可以领取的日期' })
  @Type(() => Date)
  @IsOptional()
  enableTime?: Date;

  @ApiPropertyOptional({ description: '优惠码' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional({
    description: '可领取的会员类型：0-无限制',
    example: 0,
  })
  @IsInt()
  @IsOptional()
  memberLevel?: number;

  @ApiPropertyOptional({
    description: '关联商品列表（useType=2 时使用）',
    type: [CouponProductRelationDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CouponProductRelationDto)
  @IsOptional()
  productRelationList?: CouponProductRelationDto[];

  @ApiPropertyOptional({
    description: '关联分类列表（useType=1 时使用）',
    type: [CouponProductCategoryRelationDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CouponProductCategoryRelationDto)
  @IsOptional()
  productCategoryRelationList?: CouponProductCategoryRelationDto[];
}

export class UpdateCouponDto extends PartialType(CreateCouponDto) {}
