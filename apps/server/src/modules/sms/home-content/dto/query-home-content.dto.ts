import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PageQueryDto } from '@/common/dto/page-result.dto';

/** 首页广告查询 DTO */
export class QueryHomeAdDto extends PageQueryDto {
  @ApiPropertyOptional({ description: '广告名称关键词' })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiPropertyOptional({
    description: '广告类型：0->PC首页轮播；1->app首页轮播',
    type: 'integer',
    enum: [0, 1],
  })
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  type?: number;

  @ApiPropertyOptional({ description: '到期时间（格式 yyyy-MM-dd）' })
  @IsString()
  @IsOptional()
  endTime?: string;
}

/** 推荐内容查询基类（xxxName + recommendStatus 复用） */
class BaseRecommendQueryDto extends PageQueryDto {
  @ApiPropertyOptional({
    description: '推荐状态：0->未推荐；1->已推荐',
    type: 'integer',
    enum: [0, 1],
  })
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  recommendStatus?: number;
}

/** 首页品牌推荐查询 DTO */
export class QueryHomeBrandDto extends BaseRecommendQueryDto {
  @ApiPropertyOptional({ description: '品牌名称' })
  @IsString()
  @IsOptional()
  brandName?: string;
}

/** 首页专题推荐查询 DTO */
export class QueryHomeSubjectDto extends BaseRecommendQueryDto {
  @ApiPropertyOptional({ description: '专题名称' })
  @IsString()
  @IsOptional()
  subjectName?: string;
}

/** 首页新品推荐查询 DTO */
export class QueryHomeNewProductDto extends BaseRecommendQueryDto {
  @ApiPropertyOptional({ description: '商品名称' })
  @IsString()
  @IsOptional()
  productName?: string;
}

/** 首页人气推荐查询 DTO */
export class QueryHomeRecommendProductDto extends BaseRecommendQueryDto {
  @ApiPropertyOptional({ description: '商品名称' })
  @IsString()
  @IsOptional()
  productName?: string;
}
