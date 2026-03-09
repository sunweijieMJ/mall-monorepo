import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PageQueryDto } from '@/common/dto/page-result.dto';

/** 后台资源查询 DTO */
export class QueryAdminResourceDto extends PageQueryDto {
  @ApiPropertyOptional({ description: '资源分类ID', type: 'integer' })
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  categoryId?: number;

  @ApiPropertyOptional({ description: '资源名称关键词' })
  @IsString()
  @IsOptional()
  nameKeyword?: string;

  @ApiPropertyOptional({ description: '资源URL关键词' })
  @IsString()
  @IsOptional()
  urlKeyword?: string;
}
