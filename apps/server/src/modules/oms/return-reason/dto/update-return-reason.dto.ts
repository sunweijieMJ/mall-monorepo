import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';

/** 更新退货原因 DTO */
export class UpdateReturnReasonDto {
  @ApiPropertyOptional({ description: '退货原因名称' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: '排序' })
  @IsInt()
  @Min(0)
  @IsOptional()
  sort?: number;

  @ApiPropertyOptional({ description: '状态：0->不可用；1->可用', example: 1 })
  @IsInt()
  @Min(0)
  @Max(1)
  @IsOptional()
  status?: number;
}
