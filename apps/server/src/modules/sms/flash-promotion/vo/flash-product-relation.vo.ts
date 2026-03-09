import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { FlashProductRelationEntity } from '../infrastructure/persistence/relational/entities/flash-promotion.entity';

/** 秒杀关联商品摘要 */
export class FlashProductSummaryVo {
  @ApiProperty({ description: '商品 ID' })
  id: number;

  @ApiProperty({ description: '商品名称' })
  name: string;

  @ApiProperty({ description: '商品图片' })
  pic: string;

  @ApiProperty({ description: '商品价格' })
  price: number;

  @ApiProperty({ description: '商品货号' })
  productSn: string;

  @ApiProperty({ description: '库存' })
  stock: number;
}

export class FlashProductRelationVo extends OmitType(
  FlashProductRelationEntity,
  [] as const,
) {
  @ApiPropertyOptional({
    description: '关联商品信息',
    type: FlashProductSummaryVo,
  })
  product?: FlashProductSummaryVo | null;
}
