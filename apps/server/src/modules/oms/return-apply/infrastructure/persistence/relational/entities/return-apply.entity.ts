import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('oms_order_return_apply')
export class ReturnApplyEntity {
  @ApiProperty({ description: '主键 ID', type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiPropertyOptional({ description: '会员 ID', type: 'integer' })
  @Column({ name: 'member_id', nullable: true, comment: '会员 ID' })
  memberId: number;

  @ApiProperty({ description: '订单 ID', type: 'integer' })
  @Column({ name: 'order_id' })
  orderId: number;

  @ApiPropertyOptional({ description: '公司收货地址 ID', type: 'integer' })
  @Column({ name: 'company_address_id', nullable: true })
  companyAddressId: number;

  @ApiProperty({ description: '商品 ID', type: 'integer' })
  @Column({ name: 'product_id' })
  productId: number;

  @ApiProperty({ description: '订单编号' })
  @Column({ name: 'order_sn', length: 64, default: '' })
  orderSn: string;

  @ApiProperty({ description: '会员用户名' })
  @Column({ name: 'member_username', length: 64, default: '' })
  memberUsername: string;

  @ApiProperty({ description: '退款金额', type: 'number' })
  @Column({ name: 'return_amount', type: 'decimal', precision: 10, scale: 2 })
  returnAmount: string;

  @ApiProperty({ description: '退货人姓名' })
  @Column({ name: 'return_name', length: 100, default: '' })
  returnName: string;

  @ApiProperty({ description: '退货人手机号' })
  @Column({ name: 'return_phone', length: 100, default: '' })
  returnPhone: string;

  @ApiProperty({
    description: '申请状态：0->待处理；1->退货中；2->已完成；3->已拒绝',
    type: 'integer',
    enum: [0, 1, 2, 3],
  })
  @Column({
    default: 0,
    comment: '申请状态：0->待处理；1->退货中；2->已完成；3->已拒绝',
  })
  status: number;

  @ApiPropertyOptional({ description: '处理时间' })
  @Column({ name: 'handle_time', type: 'timestamp', nullable: true })
  handleTime: Date;

  @ApiPropertyOptional({ description: '商品图片' })
  @Column({ name: 'product_pic', type: 'text', nullable: true })
  productPic: string;

  @ApiProperty({ description: '商品名称' })
  @Column({ name: 'product_name', length: 200, default: '' })
  productName: string;

  @ApiPropertyOptional({ description: '商品品牌' })
  @Column({ name: 'product_brand', length: 200, nullable: true })
  productBrand: string;

  @ApiPropertyOptional({ description: '商品销售属性' })
  @Column({ name: 'product_attr', type: 'text', nullable: true })
  productAttr: string;

  @ApiProperty({ type: 'integer', description: '商品数量' })
  @Column({ name: 'product_count', default: 0 })
  productCount: number;

  @ApiPropertyOptional({ description: '商品单价', type: 'number' })
  @Column({
    name: 'product_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  productPrice: string | null;

  @ApiPropertyOptional({ description: '商品实际支付单价', type: 'number' })
  @Column({
    name: 'product_real_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  productRealPrice: string | null;

  @ApiPropertyOptional({ description: '申请原因' })
  @Column({ type: 'text', nullable: true, comment: '申请原因' })
  reason: string;

  @ApiPropertyOptional({ description: '描述' })
  @Column({ type: 'text', nullable: true, comment: '描述' })
  description: string;

  @ApiPropertyOptional({ description: '凭证图片，以逗号隔开' })
  @Column({
    name: 'proof_pics',
    type: 'text',
    nullable: true,
    comment: '凭证图片，以逗号隔开',
  })
  proofPics: string;

  @ApiPropertyOptional({ description: '处理备注' })
  @Column({ type: 'text', nullable: true, comment: '处理备注' })
  handleNote: string;

  @ApiPropertyOptional({ description: '处理人员' })
  @Column({ name: 'handle_man', length: 100, nullable: true })
  handleMan: string;

  @ApiPropertyOptional({ description: '收货人' })
  @Column({ name: 'receive_man', length: 100, nullable: true })
  receiveMan: string;

  @ApiPropertyOptional({ description: '收货时间' })
  @Column({ name: 'receive_time', type: 'timestamp', nullable: true })
  receiveTime: Date;

  @ApiPropertyOptional({ description: '收货备注' })
  @Column({ name: 'receive_note', type: 'text', nullable: true })
  receiveNote: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
