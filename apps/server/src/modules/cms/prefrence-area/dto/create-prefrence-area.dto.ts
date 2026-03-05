import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreatePrefrenceAreaDto {
  @ApiPropertyOptional({ description: '专区名称', example: '品质生活' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: '副标题', example: '精选好物' })
  @IsString()
  @IsOptional()
  subTitle?: string;

  @ApiPropertyOptional({ description: '排序', example: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  sort?: number;

  @ApiPropertyOptional({
    description: '显示状态：0-不显示 1-显示',
    example: 0,
  })
  @IsInt()
  @IsOptional()
  showStatus?: number;
}

export class UpdatePrefrenceAreaDto extends PartialType(
  CreatePrefrenceAreaDto,
) {}
