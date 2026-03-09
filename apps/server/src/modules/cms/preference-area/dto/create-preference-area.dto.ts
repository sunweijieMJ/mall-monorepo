import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreatePreferenceAreaDto {
  @ApiProperty({ description: '专区名称', example: '品质生活' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: '副标题', example: '精选好物' })
  @IsString()
  @IsOptional()
  subTitle?: string;

  @ApiPropertyOptional({ type: 'integer', description: '排序', example: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  sort?: number;

  @ApiPropertyOptional({
    type: 'integer',
    description: '显示状态：0-不显示 1-显示',
    enum: [0, 1],
    example: 0,
  })
  @IsInt()
  @IsOptional()
  showStatus?: number;
}

export class UpdatePreferenceAreaDto extends PartialType(
  CreatePreferenceAreaDto,
) {}
