import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('oms_cart_item')
export class CartItemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'member_id' })
  memberId: number;

  @Index()
  @Column({ name: 'product_id' })
  productId: number;

  @Index()
  @Column({ name: 'product_sku_id', nullable: true })
  productSkuId: number;

  @Column({ name: 'product_name', length: 500, default: '' })
  productName: string;

  @Column({ name: 'product_pic', type: 'text', nullable: true })
  productPic: string;

  @Column({
    name: 'product_attr',
    type: 'text',
    nullable: true,
    comment: '购买时的商品规格',
  })
  productAttr: string;

  @Column({ name: 'product_brand', length: 200, nullable: true })
  productBrand: string;

  @Column({ name: 'product_sn', length: 200, nullable: true })
  productSn: string;

  @Column({ name: 'product_price', type: 'decimal', precision: 10, scale: 2 })
  productPrice: string;

  @Column({ name: 'product_quantity', default: 1 })
  productQuantity: number;

  @Column({ name: 'product_category_id', nullable: true })
  productCategoryId: number;

  @Column({
    default: 1,
    comment: '是否有效（库存不足时标记）：0->无效；1->有效',
  })
  deleteStatus: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
