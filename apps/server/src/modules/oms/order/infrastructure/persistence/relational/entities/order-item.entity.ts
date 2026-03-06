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
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'order_id', nullable: true, comment: '订单id' })
  orderId: number;

  @Column({ name: 'order_sn', length: 64, nullable: true, comment: '订单编号' })
  orderSn: string;

  @Index()
  @Column({ name: 'product_id', nullable: true })
  productId: number;

  @Column({ name: 'product_pic', length: 500, nullable: true })
  productPic: string;

  @Column({ name: 'product_name', length: 200, nullable: true })
  productName: string;

  @Column({ name: 'product_brand', length: 200, nullable: true })
  productBrand: string;

  @Column({ name: 'product_sn', length: 64, nullable: true })
  productSn: string;

  @Column({
    name: 'product_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '销售价格',
  })
  productPrice: string | null;

  @Column({
    name: 'product_quantity',
    nullable: true,
    comment: '购买数量',
  })
  productQuantity: number;

  @Column({
    name: 'product_sku_id',
    nullable: true,
    comment: '商品sku编号',
  })
  productSkuId: number;

  @Column({
    name: 'product_sku_code',
    length: 50,
    nullable: true,
    comment: '商品sku条码',
  })
  productSkuCode: string;

  @Column({
    name: 'product_category_id',
    nullable: true,
    comment: '商品分类id',
  })
  productCategoryId: number;

  @Column({
    name: 'promotion_name',
    length: 200,
    nullable: true,
    comment: '商品促销名称',
  })
  promotionName: string;

  @Column({
    name: 'promotion_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '商品促销分解金额',
  })
  promotionAmount: string | null;

  @Column({
    name: 'coupon_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '优惠券优惠分解金额',
  })
  couponAmount: string | null;

  @Column({
    name: 'integration_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '积分优惠分解金额',
  })
  integrationAmount: string | null;

  @Column({
    name: 'real_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '该商品经过优惠后的分解金额',
  })
  realAmount: string | null;

  @Column({ name: 'gift_integration', nullable: true })
  giftIntegration: number;

  @Column({ name: 'gift_growth', nullable: true })
  giftGrowth: number;

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
