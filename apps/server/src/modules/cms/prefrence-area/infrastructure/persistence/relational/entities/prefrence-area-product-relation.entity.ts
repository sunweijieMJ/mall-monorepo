import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cms_prefrence_area_product_relation')
export class PrefrenceAreaProductRelationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'prefrence_area_id', nullable: true })
  prefrenceAreaId: number;

  @Column({ name: 'product_id', nullable: true })
  productId: number;
}
