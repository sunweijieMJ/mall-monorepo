import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('pms_product_full_reduction')
export class ProductFullReductionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_id', nullable: true })
  productId: number;

  @Column({
    name: 'full_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  fullPrice: string;

  @Column({
    name: 'reduce_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  reducePrice: string;
}
