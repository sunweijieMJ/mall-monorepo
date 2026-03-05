import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ums_member_product_history')
export class MemberReadHistoryNewEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
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
  productPrice: number;

  @Column({ name: 'create_time', type: 'timestamp', nullable: true })
  createTime: Date;
}
