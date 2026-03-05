import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/** 创建后台资源 DTO */
export class CreateAdminResourceDto {
  @ApiProperty({ description: '资源名称', example: '商品列表' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '资源URL', example: '/product/list' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional({ description: '资源分类ID' })
  @IsInt()
  @IsOptional()
  categoryId?: number;

  @ApiPropertyOptional({ description: '描述' })
  @IsString()
  @IsOptional()
  description?: string;
}
