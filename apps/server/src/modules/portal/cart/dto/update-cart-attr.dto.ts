import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

/** 修改购物车商品规格 DTO（id 通过路径参数传递） */
export class UpdateCartAttrDto {
  @ApiProperty({ description: '新 SKU ID', type: 'integer' })
  @IsInt()
  @IsNotEmpty()
  productSkuId: number;
}
