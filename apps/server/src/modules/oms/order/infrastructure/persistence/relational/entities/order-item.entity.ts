import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import type { OrderEntity } from './order.entity';

@Entity('oms_order_item')
export class OrderItemEntity {
  @ApiProperty({ description: '主键 ID', type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiPropertyOptional({ description: '订单id', type: 'integer' })
  @Index()
  @Column({ name: 'order_id', nullable: true, comment: '订单id' })
  orderId: number;

  @ApiPropertyOptional({ description: '订单编号' })
  @Column({ name: 'order_sn', length: 64, nullable: true, comment: '订单编号' })
  orderSn: string;

  @ApiPropertyOptional({ description: '商品 ID', type: 'integer' })
  @Index()
  @Column({ name: 'product_id', nullable: true })
  productId: number;

  @ApiPropertyOptional({ description: '商品图片' })
  @Column({ name: 'product_pic', length: 500, nullable: true })
  productPic: string;

  @ApiPropertyOptional({ description: '商品名称' })
  @Column({ name: 'product_name', length: 200, nullable: true })
  productName: string;

  @ApiPropertyOptional({ description: '商品品牌' })
  @Column({ name: 'product_brand', length: 200, nullable: true })
  productBrand: string;

  @ApiPropertyOptional({ description: '商品货号' })
  @Column({ name: 'product_sn', length: 64, nullable: true })
  productSn: string;

  @ApiPropertyOptional({ description: '销售价格', type: 'number' })
  @Column({
    name: 'product_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '销售价格',
  })
  productPrice: string | null;

  @ApiPropertyOptional({ description: '购买数量', type: 'integer' })
  @Column({
    name: 'product_quantity',
    nullable: true,
    comment: '购买数量',
  })
  productQuantity: number;

  @ApiPropertyOptional({ description: '商品sku编号', type: 'integer' })
  @Column({
    name: 'product_sku_id',
    nullable: true,
    comment: '商品sku编号',
  })
  productSkuId: number;

  @ApiPropertyOptional({ description: '商品sku条码' })
  @Column({
    name: 'product_sku_code',
    length: 50,
    nullable: true,
    comment: '商品sku条码',
  })
  productSkuCode: string;

  @ApiPropertyOptional({ description: '商品分类id', type: 'integer' })
  @Column({
    name: 'product_category_id',
    nullable: true,
    comment: '商品分类id',
  })
  productCategoryId: number;

  @ApiPropertyOptional({ description: '商品促销名称' })
  @Column({
    name: 'promotion_name',
    length: 200,
    nullable: true,
    comment: '商品促销名称',
  })
  promotionName: string;

  @ApiPropertyOptional({ description: '商品促销分解金额', type: 'number' })
  @Column({
    name: 'promotion_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '商品促销分解金额',
  })
  promotionAmount: string | null;

  @ApiPropertyOptional({ description: '优惠券优惠分解金额', type: 'number' })
  @Column({
    name: 'coupon_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '优惠券优惠分解金额',
  })
  couponAmount: string | null;

  @ApiPropertyOptional({ description: '积分优惠分解金额', type: 'number' })
  @Column({
    name: 'integration_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '积分优惠分解金额',
  })
  integrationAmount: string | null;

  @ApiPropertyOptional({
    description: '该商品经过优惠后的分解金额',
    type: 'number',
  })
  @Column({
    name: 'real_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '该商品经过优惠后的分解金额',
  })
  realAmount: string | null;

  @ApiPropertyOptional({ description: '赠送积分', type: 'integer' })
  @Column({ name: 'gift_integration', nullable: true })
  giftIntegration: number;

  @ApiPropertyOptional({ type: 'integer', description: '赠送成长值' })
  @Column({ name: 'gift_growth', nullable: true })
  giftGrowth: number;

  @ApiPropertyOptional({ description: '商品销售属性' })
  @Column({
    name: 'product_attr',
    length: 500,
    nullable: true,
    comment: '商品销售属性',
  })
  productAttr: string;

  // ---- Relations ----

  @ManyToOne('OrderEntity', 'orderItems', {
    createForeignKeyConstraints: false,
    eager: false,
    nullable: true,
  })
  @JoinColumn({ name: 'order_id' })
  order: Relation<OrderEntity>;
}
