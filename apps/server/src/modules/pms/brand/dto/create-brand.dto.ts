import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateBrandDto {
  @ApiProperty({ example: 'Apple', description: '品牌名' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'A' })
  @IsString()
  @IsOptional()
  firstLetter?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  sort?: number;

  @ApiPropertyOptional({
    description: '是否为品牌制造商：0-否 1-是',
    example: 0,
  })
  @IsInt()
  @IsOptional()
  factoryStatus?: number;

  @ApiPropertyOptional({ example: 1 })
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
