import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sms_coupon_product_category_relation')
export class CouponProductCategoryRelationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'coupon_id', nullable: true })
  couponId: number;

  @Column({ name: 'product_category_id', nullable: true })
  productCategoryId: number;

  @Column({
    name: 'product_category_name',
    length: 200,
    nullable: true,
    comment: '产品分类名称',
  })
  productCategoryName: string;

  @Column({
    name: 'parent_category_name',
    length: 200,
    nullable: true,
    comment: '父分类名称',
  })
  parentCategoryName: string;
}
