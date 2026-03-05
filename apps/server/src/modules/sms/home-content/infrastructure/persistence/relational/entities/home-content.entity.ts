import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sms_home_advertise')
export class HomeAdvertiseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ default: 0, comment: '轮播位置：0->PC首页轮播；1->app首页轮播' })
  type: number;

  @Column({ default: '' })
  pic: string;

  @Column({ name: 'start_time', type: 'timestamp', nullable: true })
  startTime: Date;

  @Column({ name: 'end_time', type: 'timestamp', nullable: true })
  endTime: Date;

  @Column({ default: 0, comment: '上下线状态：0->下线；1->上线' })
  status: number;

  @Column({ default: 0, comment: '点击数' })
  clickCount: number;

  @Column({ default: '' })
  url: string;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ default: 0 })
  sort: number;
}

@Entity('sms_home_brand')
export class HomeBrandEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'brand_id' })
  brandId: number;

  @Column({ name: 'brand_name', length: 64, default: '' })
  brandName: string;

  @Column({
    name: 'recommend_status',
    default: 0,
    comment: '推荐状态：0->不推荐；1->推荐',
  })
  recommendStatus: number;

  @Column({ default: 0 })
  sort: number;
}

@Entity('sms_home_subject')
export class HomeSubjectEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'subject_id' })
  subjectId: number;

  @Column({ name: 'subject_name', length: 64, default: '' })
  subjectName: string;

  @Column({ name: 'recommend_status', default: 0 })
  recommendStatus: number;

  @Column({ default: 0 })
  sort: number;
}

@Entity('sms_home_new_product')
export class HomeNewProductEntity {
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

@Entity('sms_home_hot_product')
export class HomeHotProductEntity {
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
