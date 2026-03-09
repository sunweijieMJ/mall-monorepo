import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PageQueryDto } from '@/common/dto/page-result.dto';

export class CreateSubjectDto {
  @ApiPropertyOptional({ description: '分类 ID', type: 'integer' })
  @IsInt()
  @IsOptional()
  categoryId?: number;

  @ApiProperty({ description: '专题标题', example: '夏季穿搭指南' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: '专题主图 URL' })
  @IsString()
  @IsOptional()
  pic?: string;

  @ApiPropertyOptional({
    type: 'integer',
    description: '推荐状态：0-不推荐 1-推荐',
    enum: [0, 1],
    example: 0,
  })
  @IsInt()
  @IsOptional()
  recommendStatus?: number;

  @ApiPropertyOptional({ description: '画册图片，用逗号分割' })
  @IsString()
  @IsOptional()
  albumPics?: string;

  @ApiPropertyOptional({ description: '描述' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    type: 'integer',
    description: '显示状态：0-不显示 1-显示',
    enum: [0, 1],
    example: 0,
  })
  @IsInt()
  @IsOptional()
  showStatus?: number;

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
