import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pms_product')
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'brand_id', nullable: true })
  brandId: number;

  @Column({ name: 'brand_name', length: 255, default: '' })
  brandName: string;

  @Column({ name: 'product_category_id', nullable: true })
  productCategoryId: number;

  @Column({ name: 'product_category_name', length: 255, default: '' })
  productCategoryName: string;

  @Column({ name: 'product_attribute_category_id', nullable: true })
  productAttributeCategoryId: number;

  @Column({ name: 'freight_template_id', nullable: true })
  freightTemplateId: number;

  @Column({ length: 64 })
  name: string;

  @Column({ default: '' })
  pic: string;

  @Column({ name: 'product_sn', length: 64, default: '', comment: '货号' })
  productSn: string;

  @Column({
    name: 'delete_status',
    default: 0,
    comment: '删除状态：0->未删除；1->已删除',
  })
  deleteStatus: number;

  @Column({
    name: 'publish_status',
    default: 0,
    comment: '上架状态：0->下架；1->上架',
  })
  publishStatus: number;

  @Column({
    name: 'new_status',
    default: 0,
    comment: '新品状态：0->不是新品；1->新品',
  })
  newStatus: number;

  @Column({
    name: 'recommand_status',
    default: 0,
    comment: '推荐状态：0->不推荐；1->推荐',
  })
  recommandStatus: number;

  @Column({
    name: 'verify_status',
    default: 0,
    comment: '审核状态：0->未审核；1->审核通过',
  })
  verifyStatus: number;

  @Column({ default: 0 })
  sort: number;

  @Column({ default: 0 })
  sale: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({
    name: 'promotion_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  promotionPrice: number | null;

  @Column({ name: 'gift_growth', default: 0 })
  giftGrowth: number;

  @Column({ name: 'gift_point', default: 0 })
  giftPoint: number;

  @Column({ name: 'use_point_limit', type: 'int', nullable: true })
  usePointLimit: number | null;

  @Column({ name: 'sub_title', type: 'varchar', length: 255, nullable: true })
  subTitle: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    name: 'original_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  originalPrice: number | null;

  @Column({ default: 0 })
  stock: number;

  @Column({ name: 'low_stock', default: 0 })
  lowStock: number;

  @Column({ type: 'varchar', length: 16, nullable: true })
  unit: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weight: number | null;

  @Column({ name: 'preview_status', default: 0 })
  previewStatus: number;

  @Column({ name: 'service_ids', type: 'varchar', length: 64, nullable: true })
  serviceIds: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  keywords: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  note: string | null;

  @Column({ name: 'album_pics', type: 'text', nullable: true })
  albumPics: string | null;

  @Column({
    name: 'detail_title',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  detailTitle: string | null;

  @Column({ name: 'detail_desc', type: 'text', nullable: true })
  detailDesc: string | null;

  @Column({ name: 'detail_html', type: 'text', nullable: true })
  detailHtml: string | null;

  @Column({ name: 'detail_mobile_html', type: 'text', nullable: true })
  detailMobileHtml: string | null;

  @Column({ name: 'promotion_start_time', type: 'timestamp', nullable: true })
  promotionStartTime: Date | null;

  @Column({ name: 'promotion_end_time', type: 'timestamp', nullable: true })
  promotionEndTime: Date | null;

  @Column({
    name: 'promotion_per_limit',
    type: 'int',
    nullable: true,
    comment: '活动限购数量',
  })
  promotionPerLimit: number | null;

  @Column({
    name: 'promotion_type',
    default: 0,
    comment: '促销类型：0无优惠 1特惠 2会员价 3阶梯价 4满减',
  })
  promotionType: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
