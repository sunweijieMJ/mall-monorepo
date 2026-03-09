import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateBrandDto {
  @ApiProperty({ example: 'Apple', description: '品牌名' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: '品牌首字母', example: 'A' })
  @IsString()
  @IsOptional()
  firstLetter?: string;

  @ApiPropertyOptional({ type: 'integer', description: '排序权重', example: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  sort?: number;

  @ApiPropertyOptional({
    type: 'integer',
    description: '是否为品牌制造商：0-否 1-是',
    enum: [0, 1],
    example: 0,
  })
  @IsInt()
  @IsOptional()
  factoryStatus?: number;

  @ApiPropertyOptional({
    type: 'integer',
    description: '显示状态：0-隐藏 1-显示',
    enum: [0, 1],
    example: 1,
  })
  @IsInt()
  @IsOptional()
  showStatus?: number;

  @ApiPropertyOptional({ description: 'logo 图片地址' })
  @IsString()
  @IsOptional()
  logo?: string;

  @ApiPropertyOptional({ description: '大图地址' })
  @IsString()
  @IsOptional()
  bigPic?: string;

  @ApiPropertyOptional({ description: '品牌故事' })
  @IsString()
  @IsOptional()
  brandStory?: string;
}

export class UpdateBrandDto extends PartialType(CreateBrandDto) {}
