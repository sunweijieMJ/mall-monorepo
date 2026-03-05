import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CouponEntity } from './coupon.entity';

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

  // ---- Relations ----

  @ManyToOne(() => CouponEntity, (coupon) => coupon.couponProductRelations, {
    createForeignKeyConstraints: false,
    eager: false,
    nullable: true,
  })
  @JoinColumn({ name: 'coupon_id' })
  coupon: CouponEntity;
}
