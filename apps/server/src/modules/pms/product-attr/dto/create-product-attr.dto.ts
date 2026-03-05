import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

// ---- 属性分类 DTO ----

export class CreateProductAttrCategoryDto {
  @ApiProperty({ description: '属性分类名称', example: '颜色' })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateProductAttrCategoryDto extends PartialType(
  CreateProductAttrCategoryDto,
) {}

// ---- 商品属性 DTO ----

export class CreateProductAttrDto {
  @ApiProperty({ description: '所属属性分类 ID', example: 1 })
  @IsInt()
  productAttributeCategoryId: number;

  @ApiProperty({ description: '属性名称', example: '颜色' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: '属性选择类型：0-唯一 1-单选 2-多选',
    example: 0,
  })
  @IsInt()
  @IsOptional()
  selectType?: number;

  @ApiPropertyOptional({
    description: '属性录入方式：0-手工录入 1-从列表中选取',
    example: 0,
  })
  @IsInt()
  @IsOptional()
  inputType?: number;

  @ApiPropertyOptional({
    description: '可选值列表，以逗号隔开',
    example: '红色,蓝色,绿色',
  })
  @IsString()
  @IsOptional()
  inputList?: string;

  @ApiPropertyOptional({ description: '排序', example: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  sort?: number;

  @ApiPropertyOptional({
    description: '分类筛选样式：0-普通 1-颜色',
    example: 0,
  })
  @IsInt()
  @IsOptional()
  filterType?: number;

  @ApiPropertyOptional({
    description: '检索类型：0-不检索 1-关键字检索 2-范围检索',
    example: 0,
  })
  @IsInt()
  @IsOptional()
  searchType?: number;

  @ApiPropertyOptional({
    description: '相同属性产品是否关联：0-不关联 1-关联',
    example: 0,
  })
  @IsInt()
  @IsOptional()
  relatedStatus?: number;

  @ApiPropertyOptional({
    description: '是否支持手动新增：0-不支持 1-支持',
    example: 0,
  })
  @IsInt()
  @IsOptional()
  handAddStatus?: number;

  @ApiPropertyOptional({
    description: '属性类型：0-规格 1-参数',
    example: 0,
  })
  @IsInt()
  @IsOptional()
  type?: number;
}

export class UpdateProductAttrDto extends PartialType(CreateProductAttrDto) {}
