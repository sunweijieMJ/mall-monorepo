import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

/** 添加商品收藏 DTO */
export class AddCollectionDto {
  @ApiProperty({ description: '商品 ID', type: 'integer' })
  @IsInt()
  productId: number;
}
