import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// ---- 秒杀活动 DTO ----

export class CreateFlashPromotionDto {
  @ApiProperty({ description: '活动标题', example: '618 秒杀' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: '开始日期', example: '2026-06-01' })
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({ description: '结束日期', example: '2026-06-18' })
  @Type(() => Date)
  endDate: Date;

  @ApiPropertyOptional({
    description: '上下线状态：0-下线 1-上线',
    example: 0,
  })
  @IsInt()
  @IsOptional()
  status?: number;
}

export class UpdateFlashPromotionDto extends PartialType(
  CreateFlashPromotionDto,
) {}

// ---- 秒杀场次 DTO ----

export class CreateFlashSessionDto {
  @ApiProperty({ description: '场次名称', example: '08:00 场' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '开始时间（HH:mm:ss）', example: '08:00:00' })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ description: '结束时间（HH:mm:ss）', example: '10:00:00' })
  @IsString()
  @IsNotEmpty()
  endTime: string;

  @ApiPropertyOptional({
    description: '启用状态：0-不启用 1-启用',
    example: 1,
  })
  @IsInt()
  @IsOptional()
  status?: number;
}

export class UpdateFlashSessionDto extends PartialType(CreateFlashSessionDto) {}

// ---- 秒杀商品关联 DTO ----

export class CreateFlashProductRelationDto {
  @ApiProperty({ description: '秒杀活动 ID' })
  @IsInt()
  flashPromotionId: number;

  @ApiProperty({ description: '秒杀场次 ID' })
  @IsInt()
  flashPromotionSessionId: number;

  @ApiProperty({ description: '商品 ID' })
  @IsInt()
  productId: number;

  @ApiProperty({ description: '秒杀价格', example: 99.0 })
  @IsNumber()
  flashPromotionPrice: number;

  @ApiProperty({ description: '秒杀数量', example: 100 })
  @IsInt()
  @Min(0)
  flashPromotionCount: number;

  @ApiProperty({ description: '每人限购数量', example: 1 })
  @IsInt()
  @Min(0)
  flashPromotionLimit: number;

  @ApiPropertyOptional({ description: '排序', example: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  sort?: number;
}

export class UpdateFlashProductRelationDto extends PartialType(
  CreateFlashProductRelationDto,
) {}

export class BatchCreateFlashProductRelationDto {
  @ApiProperty({
    description: '秒杀商品关联列表',
    type: [CreateFlashProductRelationDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFlashProductRelationDto)
  list: CreateFlashProductRelationDto[];
}
