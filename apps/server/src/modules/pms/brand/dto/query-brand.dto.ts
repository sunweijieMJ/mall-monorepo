import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PageQueryDto } from '@/common/dto/page-result.dto';

export class QueryBrandDto extends PageQueryDto {
  @ApiPropertyOptional({ description: '品牌名关键词' })
  @IsString()
  @IsOptional()
  keyword?: string;
}
