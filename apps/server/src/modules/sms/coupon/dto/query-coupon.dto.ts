import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PageQueryDto } from '@/common/dto/page-result.dto';

/** 优惠券列表查询 DTO */
export class QueryCouponDto extends PageQueryDto {
  @ApiPropertyOptional({ description: '优惠券名称关键词' })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiPropertyOptional({
    description: '优惠券类型：0->全场通用；1->指定分类；2->指定商品',
    type: 'integer',
    enum: [0, 1, 2],
  })
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  type?: number;
}

/** 优惠券领取记录查询 DTO */
export class QueryCouponHistoryDto extends PageQueryDto {
  @ApiPropertyOptional({ description: '优惠券ID', type: 'integer' })
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  couponId?: number;

  @ApiPropertyOptional({
    description: '使用状态：0->未使用；1->已使用；2->已过期',
    type: 'integer',
    enum: [0, 1, 2],
  })
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  useStatus?: number;

  @ApiPropertyOptional({ description: '订单编号' })
  @IsString()
  @IsOptional()
  orderSn?: string;
}
