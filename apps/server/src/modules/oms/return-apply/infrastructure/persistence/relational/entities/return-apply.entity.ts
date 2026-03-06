import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('oms_order_return_apply')
export class ReturnApplyEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'member_id', nullable: true, comment: '会员 ID' })
  memberId: number;

  @Column({ name: 'order_id' })
  orderId: number;

  @Column({ name: 'company_address_id', nullable: true })
  companyAddressId: number;

  @Column({ name: 'product_id' })
  productId: number;

  @Column({ name: 'order_sn', length: 64, default: '' })
  orderSn: string;

  @Column({ name: 'member_username', length: 64, default: '' })
  memberUsername: string;

  @Column({ name: 'return_amount', type: 'decimal', precision: 10, scale: 2 })
  returnAmount: string;

  @Column({ name: 'return_name', length: 100, default: '' })
  returnName: string;

  @Column({ name: 'return_phone', length: 100, default: '' })
  returnPhone: string;

  @Column({
    default: 0,
    comment: '申请状态：0->待处理；1->退货中；2->已完成；3->已拒绝',
  })
  status: number;

  @Column({ name: 'handle_time', type: 'timestamp', nullable: true })
  handleTime: Date;

  @Column({ name: 'product_pic', type: 'text', nullable: true })
  productPic: string;

  @Column({ name: 'product_name', length: 200, default: '' })
  productName: string;

  @Column({ name: 'product_brand', length: 200, nullable: true })
  productBrand: string;

  @Column({ name: 'product_attr', type: 'text', nullable: true })
  productAttr: string;

  @Column({ name: 'product_count', default: 0 })
  productCount: number;

  @Column({
    name: 'product_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  productPrice: string | null;

  @Column({
    name: 'product_real_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  productRealPrice: string | null;

  @Column({ type: 'text', nullable: true, comment: '申请原因' })
  reason: string;

  @Column({ type: 'text', nullable: true, comment: '描述' })
  description: string;

  @Column({
    name: 'proof_pics',
    type: 'text',
    nullable: true,
    comment: '凭证图片，以逗号隔开',
  })
  proofPics: string;

  @Column({ type: 'text', nullable: true, comment: '处理备注' })
  handleNote: string;

  @Column({ name: 'handle_man', length: 100, nullable: true })
  handleMan: string;

  @Column({ name: 'receive_man', length: 100, nullable: true })
  receiveMan: string;

  @Column({ name: 'receive_time', type: 'timestamp', nullable: true })
  receiveTime: Date;

  @Column({ name: 'receive_note', type: 'text', nullable: true })
  receiveNote: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
