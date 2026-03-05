import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PageQueryDto } from '@/common/dto/page-result.dto';

export class CreateSubjectDto {
  @ApiPropertyOptional({ description: '分类 ID' })
  @IsInt()
  @IsOptional()
  categoryId?: number;

  @ApiPropertyOptional({ description: '专题标题', example: '夏季穿搭指南' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: '专题主图 URL' })
  @IsString()
  @IsOptional()
  pic?: string;

  @ApiPropertyOptional({ description: '关联产品数量' })
  @IsInt()
  @Min(0)
  @IsOptional()
  productCount?: number;

  @ApiPropertyOptional({
    description: '推荐状态：0-不推荐 1-推荐',
    example: 0,
  })
  @IsInt()
  @IsOptional()
  recommendStatus?: number;

  @ApiPropertyOptional({ description: '收藏数' })
  @IsInt()
  @Min(0)
  @IsOptional()
  collectCount?: number;

  @ApiPropertyOptional({ description: '阅读数' })
  @IsInt()
  @Min(0)
  @IsOptional()
  readCount?: number;

  @ApiPropertyOptional({ description: '评论数' })
  @IsInt()
  @Min(0)
  @IsOptional()
  commentCount?: number;

  @ApiPropertyOptional({ description: '画册图片，用逗号分割' })
  @IsString()
  @IsOptional()
  albumPics?: string;

  @ApiPropertyOptional({ description: '描述' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: '显示状态：0-不显示 1-显示',
    example: 0,
  })
  @IsInt()
  @IsOptional()
  showStatus?: number;

  @ApiPropertyOptional({ description: '转发数' })
  @IsInt()
  @Min(0)
  @IsOptional()
  forwardCount?: number;

  @ApiPropertyOptional({ description: '专题分类名称' })
  @IsString()
  @IsOptional()
  categoryName?: string;

  @ApiPropertyOptional({ description: '专题内容（富文本）' })
  @IsString()
  @IsOptional()
  content?: string;
}

export class UpdateSubjectDto extends PartialType(CreateSubjectDto) {}

export class SubjectQueryDto extends PageQueryDto {
  @ApiPropertyOptional({ description: '关键词，模糊匹配标题' })
  @IsString()
  @IsOptional()
  keyword?: string;
}
