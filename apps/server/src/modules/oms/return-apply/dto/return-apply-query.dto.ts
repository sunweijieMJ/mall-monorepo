import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PageQueryDto } from '@/common/dto/page-result.dto';

/** 退货申请查询 DTO */
export class ReturnApplyQueryDto extends PageQueryDto {
  @ApiPropertyOptional({
    type: 'integer',
    description: '申请状态：0->待处理；1->退货中；2->已完成；3->已拒绝',
    enum: [0, 1, 2, 3],
  })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => Number(value))
  status?: number;

  @ApiPropertyOptional({ description: '开始时间', format: 'date-time' })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({ description: '结束时间', format: 'date-time' })
  @IsOptional()
  @IsString()
  endTime?: string;
}
