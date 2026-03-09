import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { PageQueryDto } from '@/common/dto/page-result.dto';

/** 商品属性列表查询 DTO */
export class QueryProductAttrDto extends PageQueryDto {
  @ApiProperty({ description: '属性分类ID', type: 'integer' })
  @IsInt()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  categoryId: number;

  @ApiPropertyOptional({
    description: '属性类型：0->规格；1->参数',
    type: 'integer',
    enum: [0, 1],
  })
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  type?: number;
}
