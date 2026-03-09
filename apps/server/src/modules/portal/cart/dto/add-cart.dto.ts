import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

/** 添加购物车 DTO */
export class AddCartDto {
  @ApiProperty({ description: '商品 ID', type: 'integer' })
  @IsInt()
  productId: number;

  @ApiProperty({ description: 'SKU ID', type: 'integer' })
  @IsInt()
  productSkuId: number;

  @ApiProperty({ type: 'integer', description: '数量' })
  @IsInt()
  @Min(1)
  productQuantity: number;
}
