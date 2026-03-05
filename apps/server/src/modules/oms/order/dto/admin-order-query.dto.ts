import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { PageQueryDto } from '@/common/dto/page-result.dto';

/** 管理端订单列表查询 DTO */
export class AdminOrderQueryDto extends PageQueryDto {
  @ApiPropertyOptional({ description: '订单号' })
  @IsString()
  @IsOptional()
  orderSn?: string;

  @ApiPropertyOptional({ description: '收货人姓名/手机号关键词' })
  @IsString()
  @IsOptional()
  receiverKeyword?: string;

  @ApiPropertyOptional({
    description:
      '订单状态：0->待付款；1->已付款；2->已发货；3->已完成；4->已取消；5->售后关闭',
  })
  @IsInt()
  @Min(0)
  @Max(5)
  @Type(() => Number)
  @IsOptional()
  status?: number;

  @ApiPropertyOptional({
    description: '支付方式：0->未支付；1->支付宝；2->微信',
  })
  @IsInt()
  @Min(0)
  @Max(2)
  @Type(() => Number)
  @IsOptional()
  payType?: number;

  @ApiPropertyOptional({ description: '订单来源：0->PC；1->app' })
  @IsInt()
  @Min(0)
  @Max(1)
  @Type(() => Number)
  @IsOptional()
  sourceType?: number;

  @ApiPropertyOptional({ description: '创建时间（起）' })
  @IsString()
  @IsOptional()
  createTime?: string;

  @ApiPropertyOptional({ description: '创建时间（止）' })
  @IsString()
  @IsOptional()
  endTime?: string;
}
