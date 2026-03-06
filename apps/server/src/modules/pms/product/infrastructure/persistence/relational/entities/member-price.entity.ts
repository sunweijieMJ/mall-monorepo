import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import type { ProductEntity } from './product.entity';

@Entity('pms_member_price')
export class MemberPriceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
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
  memberPrice: string | null;

  @Column({ name: 'member_level_name', length: 100, nullable: true })
  memberLevelName: string;

  // ---- Relations ----

  @ManyToOne('ProductEntity', 'memberPrices', {
    createForeignKeyConstraints: false,
    eager: false,
    nullable: true,
  })
  @JoinColumn({ name: 'product_id' })
  product: Relation<ProductEntity>;
}
