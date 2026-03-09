import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PageQueryDto } from '@/common/dto/page-result.dto';

/** 限时购活动查询 DTO */
export class QueryFlashPromotionDto extends PageQueryDto {
  @ApiPropertyOptional({ description: '活动名称关键词' })
  @IsString()
  @IsOptional()
  keyword?: string;
}
