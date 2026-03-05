import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

/** 更新后台资源 DTO */
export class UpdateAdminResourceDto {
  @ApiPropertyOptional({ description: '资源名称' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: '资源URL' })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiPropertyOptional({ description: '资源分类ID' })
  @IsInt()
  @IsOptional()
  categoryId?: number;

  @ApiPropertyOptional({ description: '描述' })
  @IsString()
  @IsOptional()
  description?: string;
}
