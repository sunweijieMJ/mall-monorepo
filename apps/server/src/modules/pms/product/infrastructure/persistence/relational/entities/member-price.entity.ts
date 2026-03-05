import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('pms_member_price')
export class MemberPriceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_id', nullable: true })
  productId: number;

  @Column({ name: 'member_level_id', nullable: true })
  memberLevelId: number;

  @Column({
    name: 'member_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '会员价格',
  })
  memberPrice: string;

  @Column({ name: 'member_level_name', length: 100, nullable: true })
  memberLevelName: string;
}
