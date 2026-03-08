import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** 商品简要信息 VO（选择器用，仅包含 id/name/pic） */
export class ProductOptionVo {
  @ApiProperty({ description: '商品ID', type: 'integer' })
  id: number;

  @ApiProperty({ description: '商品名称' })
  name: string;

  @ApiPropertyOptional({ description: '商品图片' })
  pic?: string;
}
