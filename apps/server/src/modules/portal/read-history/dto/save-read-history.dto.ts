import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

/** 保存浏览历史 DTO */
export class SaveReadHistoryDto {
  @ApiProperty({ description: '商品 ID', type: 'integer' })
  @IsInt()
  productId: number;
}
