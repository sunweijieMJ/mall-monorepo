import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { PageQueryDto } from '@/common/dto/page-result.dto';

/** 移动端 - 商品搜索查询 DTO */
export class PortalProductSearchDto extends PageQueryDto {
  @ApiPropertyOptional({ description: '关键词' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: '品牌 ID', type: 'integer' })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => (value != null ? Number(value) : undefined))
  brandId?: number;

  @ApiPropertyOptional({ description: '分类 ID', type: 'integer' })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => (value != null ? Number(value) : undefined))
  productCategoryId?: number;

  @ApiPropertyOptional({
    type: 'integer',
    description: '排序方式：1-新品 2-销量 3-价格升序 4-价格降序',
    enum: [1, 2, 3, 4],
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  @Transform(({ value }) => (value != null ? Number(value) : undefined))
  sort?: number;
}
