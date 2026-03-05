import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('pms_product_vertify_record')
export class ProductVertifyRecordEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_id', nullable: true })
  productId: number;

  @Column({ name: 'create_time', type: 'timestamp', nullable: true })
  createTime: Date;

  @Column({
    name: 'vertify_man',
    length: 64,
    nullable: true,
    comment: '审核人',
  })
  vertifyMan: string;

  @Column({ nullable: true })
  status: number;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '反馈详情' })
  detail: string;
}
