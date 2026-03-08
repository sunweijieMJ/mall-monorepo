import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sms_home_advertise')
export class HomeAdvertiseEntity {
  @ApiProperty({ description: '主键ID', type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '广告名称' })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({
    description: '轮播位置：0->PC首页轮播；1->app首页轮播',
    type: 'integer',
    enum: [0, 1],
  })
  @Column({ default: 0, comment: '轮播位置：0->PC首页轮播；1->app首页轮播' })
  type: number;

  @ApiProperty({ description: '图片地址' })
  @Column({ default: '' })
  pic: string;

  @ApiPropertyOptional({ description: '开始时间' })
  @Column({ name: 'start_time', type: 'timestamp', nullable: true })
  startTime: Date;

  @ApiPropertyOptional({ description: '结束时间' })
  @Column({ name: 'end_time', type: 'timestamp', nullable: true })
  endTime: Date;

  @ApiProperty({
    description: '上下线状态：0->下线；1->上线',
    type: 'integer',
    enum: [0, 1],
  })
  @Column({ default: 0, comment: '上下线状态：0->下线；1->上线' })
  status: number;

  @ApiProperty({ type: 'integer', description: '点击数' })
  @Column({ default: 0, comment: '点击数' })
  clickCount: number;

  @ApiProperty({ type: 'integer', description: '下单数' })
  @Column({ name: 'order_count', default: 0, comment: '下单数' })
  orderCount: number;

  @ApiProperty({ description: '链接地址' })
  @Column({ default: '' })
  url: string;

  @ApiPropertyOptional({ description: '备注' })
  @Column({ type: 'text', nullable: true })
  note: string;

  @ApiProperty({ type: 'integer', description: '排序' })
  @Column({ default: 0 })
  sort: number;
}

@Entity('sms_home_brand')
export class HomeBrandEntity {
  @ApiProperty({ description: '主键ID', type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '品牌ID', type: 'integer' })
  @Column({ name: 'brand_id' })
  brandId: number;

  @ApiProperty({ description: '品牌名称' })
  @Column({ name: 'brand_name', length: 64, default: '' })
  brandName: string;

  @ApiProperty({
    description: '推荐状态：0->不推荐；1->推荐',
    type: 'integer',
    enum: [0, 1],
  })
  @Column({
    name: 'recommend_status',
    default: 0,
    comment: '推荐状态：0->不推荐；1->推荐',
  })
  recommendStatus: number;

  @ApiProperty({ type: 'integer', description: '排序' })
  @Column({ default: 0 })
  sort: number;
}

@Entity('sms_home_subject')
export class HomeSubjectEntity {
  @ApiProperty({ description: '主键ID', type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '专题ID', type: 'integer' })
  @Column({ name: 'subject_id' })
  subjectId: number;

  @ApiProperty({ description: '专题名称' })
  @Column({ name: 'subject_name', length: 64, default: '' })
  subjectName: string;

  @ApiProperty({ type: 'integer', description: '推荐状态' })
  @Column({ name: 'recommend_status', default: 0 })
  recommendStatus: number;

  @ApiProperty({ type: 'integer', description: '排序' })
  @Column({ default: 0 })
  sort: number;
}

@Entity('sms_home_new_product')
export class HomeNewProductEntity {
  @ApiProperty({ description: '主键ID', type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '商品ID', type: 'integer' })
  @Column({ name: 'product_id' })
  productId: number;

  @ApiProperty({ description: '商品名称' })
  @Column({ name: 'product_name', length: 200, default: '' })
  productName: string;

  @ApiProperty({ type: 'integer', description: '推荐状态' })
  @Column({ name: 'recommend_status', default: 0 })
  recommendStatus: number;

  @ApiProperty({ type: 'integer', description: '排序' })
  @Column({ default: 0 })
  sort: number;
}

@Entity('sms_home_hot_product')
export class HomeHotProductEntity {
  @ApiProperty({ description: '主键ID', type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '商品ID', type: 'integer' })
  @Column({ name: 'product_id' })
  productId: number;

  @ApiProperty({ description: '商品名称' })
  @Column({ name: 'product_name', length: 200, default: '' })
  productName: string;

  @ApiProperty({ type: 'integer', description: '推荐状态' })
  @Column({ name: 'recommend_status', default: 0 })
  recommendStatus: number;

  @ApiProperty({ type: 'integer', description: '排序' })
  @Column({ default: 0 })
  sort: number;
}
