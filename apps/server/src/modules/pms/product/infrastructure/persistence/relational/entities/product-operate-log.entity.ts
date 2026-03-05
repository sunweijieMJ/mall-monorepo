import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('pms_product_operate_log')
export class ProductOperateLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_id', nullable: true })
  productId: number;

  @Column({
    name: 'price_old',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  priceOld: string;

  @Column({
    name: 'price_new',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  priceNew: string;

  @Column({
    name: 'sale_price_old',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  salePriceOld: string;

  @Column({
    name: 'sale_price_new',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  salePriceNew: string;

  @Column({
    name: 'gift_point_old',
    nullable: true,
    comment: '赠送的积分',
  })
  giftPointOld: number;

  @Column({ name: 'gift_point_new', nullable: true })
  giftPointNew: number;

  @Column({ name: 'use_point_limit_old', nullable: true })
  usePointLimitOld: number;

  @Column({ name: 'use_point_limit_new', nullable: true })
  usePointLimitNew: number;

  @Column({
    name: 'operate_man',
    length: 64,
    nullable: true,
    comment: '操作人',
  })
  operateMan: string;

  @Column({ name: 'create_time', type: 'timestamp', nullable: true })
  createTime: Date;
}
