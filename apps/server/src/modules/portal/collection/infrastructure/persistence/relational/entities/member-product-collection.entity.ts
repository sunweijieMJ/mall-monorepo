import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ums_member_product_collection')
export class MemberProductCollectionNewEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'member_id' })
  memberId: number;

  @Column({ name: 'product_id' })
  productId: number;

  @Column({ name: 'product_name', length: 500, nullable: true })
  productName: string;

  @Column({ name: 'product_pic', type: 'text', nullable: true })
  productPic: string;

  @Column({
    name: 'product_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  productPrice: string;

  @Column({ name: 'create_time', type: 'timestamp', nullable: true })
  createTime: Date;
}
