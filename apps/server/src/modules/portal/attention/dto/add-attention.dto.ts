import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

/** 添加品牌关注 DTO */
export class AddAttentionDto {
  @ApiProperty({ description: '品牌 ID', type: 'integer' })
  @IsInt()
  brandId: number;
}
