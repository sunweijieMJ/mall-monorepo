import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sms_coupon_product_relation')
export class CouponProductRelationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'coupon_id', nullable: true })
  couponId: number;

  @Column({ name: 'product_id', nullable: true })
  productId: number;

  @Column({
    name: 'product_name',
    length: 200,
    nullable: true,
    comment: '商品名称',
  })
  productName: string;

  @Column({
    name: 'product_sn',
    length: 64,
    nullable: true,
    comment: '商品编码',
  })
  productSn: string;
}
