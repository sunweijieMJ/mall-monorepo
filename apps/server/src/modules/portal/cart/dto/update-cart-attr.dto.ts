import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

/** 修改购物车商品规格 DTO */
export class UpdateCartAttrDto {
  @ApiProperty({ description: '购物车条目 ID' })
  @IsInt()
  @IsNotEmpty()
  id: number;

  @ApiProperty({ description: '新 SKU ID' })
  @IsInt()
  @IsNotEmpty()
  productSkuId: number;
}
