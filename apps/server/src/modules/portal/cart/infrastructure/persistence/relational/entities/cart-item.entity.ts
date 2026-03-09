import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('oms_cart_item')
@Index('IDX_cart_member_sku_active', ['memberId', 'productSkuId'], {
  unique: true,
  where: '"delete_status" = 1',
})
export class CartItemEntity {
  @ApiProperty({ description: '主键ID', type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '会员ID', type: 'integer' })
  @Index()
  @Column({ name: 'member_id' })
  memberId: number;

  @ApiProperty({ description: '商品ID', type: 'integer' })
  @Index()
  @Column({ name: 'product_id' })
  productId: number;

  @ApiPropertyOptional({ description: '商品SKU ID', type: 'integer' })
  @Index()
  @Column({ name: 'product_sku_id', nullable: true })
  productSkuId: number;

  @ApiProperty({ description: '商品名称' })
  @Column({ name: 'product_name', length: 500, default: '' })
  productName: string;

  @ApiPropertyOptional({ description: '商品图片' })
  @Column({ name: 'product_pic', type: 'text', nullable: true })
  productPic: string;

  @ApiPropertyOptional({ description: '购买时的商品规格' })
  @Column({
    name: 'product_attr',
    type: 'text',
    nullable: true,
    comment: '购买时的商品规格',
  })
  productAttr: string;

  @ApiPropertyOptional({ description: '商品品牌' })
  @Column({ name: 'product_brand', length: 200, nullable: true })
  productBrand: string;

  @ApiPropertyOptional({ description: '商品货号' })
  @Column({ name: 'product_sn', length: 200, nullable: true })
  productSn: string;

  @ApiProperty({ description: '商品价格', type: 'number' })
  @Column({ name: 'product_price', type: 'decimal', precision: 10, scale: 2 })
  productPrice: string;

  @ApiProperty({ type: 'integer', description: '商品数量' })
  @Column({ name: 'product_quantity', default: 1 })
  productQuantity: number;

  @ApiPropertyOptional({ description: '商品分类ID', type: 'integer' })
  @Column({ name: 'product_category_id', nullable: true })
  productCategoryId: number;

  @ApiProperty({
    description: '是否有效（库存不足时标记）：0->无效；1->有效',
    type: 'integer',
    enum: [0, 1],
  })
  @Column({
    name: 'delete_status',
    default: 1,
    comment: '是否有效（库存不足时标记）：0->无效；1->有效',
  })
  deleteStatus: number;

  @ApiProperty({ description: '创建时间', format: 'date-time' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间', format: 'date-time' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
