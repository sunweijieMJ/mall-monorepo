import { ApiProperty } from '@nestjs/swagger';

/**
 * 人气推荐商品 VO
 * 与 HomeHotProductEntity 字段相同，但作为独立的 Swagger Schema
 * 避免前端代码生成时 recommend 接口返回 "HomeHotProduct" 类型名
 */
export class HomeRecommendProductVo {
  @ApiProperty({ description: '主键ID', type: 'integer' })
  id: number;

  @ApiProperty({ description: '商品ID', type: 'integer' })
  productId: number;

  @ApiProperty({ description: '商品名称' })
  productName: string;

  @ApiProperty({ type: 'integer', description: '推荐状态' })
  recommendStatus: number;

  @ApiProperty({ type: 'integer', description: '排序' })
  sort: number;
}
