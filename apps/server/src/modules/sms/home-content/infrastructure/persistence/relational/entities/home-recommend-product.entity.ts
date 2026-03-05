import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sms_home_recommend_product')
export class HomeRecommendProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_id' })
  productId: number;

  @Column({ name: 'product_name', length: 200, default: '' })
  productName: string;

  @Column({ name: 'recommend_status', default: 0 })
  recommendStatus: number;

  @Column({ default: 0 })
  sort: number;
}
