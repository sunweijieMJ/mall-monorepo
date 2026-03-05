import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('pms_product_ladder')
export class ProductLadderEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_id', nullable: true })
  productId: number;

  @Column({ nullable: true, comment: '满足的商品数量' })
  count: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '折扣',
  })
  discount: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '折后价格',
  })
  price: string;
}
