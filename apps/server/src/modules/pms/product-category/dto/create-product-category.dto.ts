import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductCategoryDto {
  @ApiProperty({ description: '父级分类 ID，0 表示一级分类', example: 0 })
  @IsInt()
  @Min(0)
  parentId: number;

  @ApiProperty({ description: '分类名称', example: '服装' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: '商品单位', example: '件' })
  @IsString()
  @IsOptional()
  productUnit?: string;

  @ApiPropertyOptional({
    description: '是否显示在导航栏：0-不显示 1-显示',
    example: 0,
  })
  @IsInt()
  @IsOptional()
  navStatus?: number;

  @ApiPropertyOptional({
    description: '显示状态：0-不显示 1-显示',
    example: 1,
  })
  @IsInt()
  @IsOptional()
  showStatus?: number;

  @ApiPropertyOptional({ description: '排序', example: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  sort?: number;

  @ApiPropertyOptional({ description: '图标 URL' })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({ description: '关键词' })
  @IsString()
  @IsOptional()
  keywords?: string;

  @ApiPropertyOptional({ description: '描述' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateProductCategoryDto extends PartialType(
  CreateProductCategoryDto,
) {}
