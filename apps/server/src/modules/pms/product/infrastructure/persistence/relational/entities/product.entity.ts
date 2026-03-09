import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BrandEntity } from '../../../../../brand/infrastructure/persistence/relational/entities/brand.entity';
import { ProductCategoryEntity } from '../../../../../product-category/infrastructure/persistence/relational/entities/product-category.entity';
import { SkuStockEntity } from '../../../../../sku-stock/infrastructure/persistence/relational/entities/sku-stock.entity';
import { ProductAttrValueEntity } from './product-attr-value.entity';
import { ProductLadderEntity } from './product-ladder.entity';
import { ProductFullReductionEntity } from './product-full-reduction.entity';
import { MemberPriceEntity } from './member-price.entity';

@Entity('pms_product')
export class ProductEntity {
  @ApiProperty({ description: '商品ID', type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiPropertyOptional({ description: '品牌ID', type: 'integer' })
  @Index()
  @Column({ name: 'brand_id', nullable: true })
  brandId: number;

  @ApiProperty({ description: '品牌名称' })
  @Column({ name: 'brand_name', length: 255, default: '' })
  brandName: string;

  @ApiPropertyOptional({ description: '商品分类ID', type: 'integer' })
  @Index()
  @Column({ name: 'product_category_id', nullable: true })
  productCategoryId: number;

  @ApiProperty({ description: '商品分类名称' })
  @Column({ name: 'product_category_name', length: 255, default: '' })
  productCategoryName: string;

  @ApiPropertyOptional({ description: '商品属性分类ID', type: 'integer' })
  @Column({ name: 'product_attribute_category_id', nullable: true })
  productAttributeCategoryId: number;

  @ApiPropertyOptional({ description: '运费模板ID', type: 'integer' })
  @Column({ name: 'freight_template_id', nullable: true })
  freightTemplateId: number;

  @ApiProperty({ description: '商品名称' })
  @Column({ length: 64 })
  name: string;

  @ApiProperty({ description: '商品图片' })
  @Column({ default: '' })
  pic: string;

  @ApiProperty({ description: '货号' })
  @Column({ name: 'product_sn', length: 64, default: '', comment: '货号' })
  productSn: string;

  @ApiProperty({
    description: '删除状态：0->未删除；1->已删除',
    type: 'integer',
    enum: [0, 1],
  })
  @Column({
    name: 'delete_status',
    default: 0,
    comment: '删除状态：0->未删除；1->已删除',
  })
  deleteStatus: number;

  @ApiProperty({
    description: '上架状态：0->下架；1->上架',
    type: 'integer',
    enum: [0, 1],
  })
  @Column({
    name: 'publish_status',
    default: 0,
    comment: '上架状态：0->下架；1->上架',
  })
  publishStatus: number;

  @ApiProperty({
    description: '新品状态：0->不是新品；1->新品',
    type: 'integer',
    enum: [0, 1],
  })
  @Column({
    name: 'new_status',
    default: 0,
    comment: '新品状态：0->不是新品；1->新品',
  })
  newStatus: number;

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

  @ApiProperty({
    description: '审核状态：0->未审核；1->审核通过',
    type: 'integer',
    enum: [0, 1],
  })
  @Column({
    name: 'verify_status',
    default: 0,
    comment: '审核状态：0->未审核；1->审核通过',
  })
  verifyStatus: number;

  @ApiProperty({ type: 'integer', description: '排序' })
  @Column({ default: 0 })
  sort: number;

  @ApiProperty({ type: 'integer', description: '销量' })
  @Column({ default: 0 })
  sale: number;

  @ApiProperty({ description: '价格', type: 'number' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: string;

  @ApiPropertyOptional({ description: '促销价格', type: 'number' })
  @Column({
    name: 'promotion_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  promotionPrice: string | null;

  @ApiProperty({ type: 'integer', description: '赠送的成长值' })
  @Column({ name: 'gift_growth', default: 0 })
  giftGrowth: number;

  @ApiProperty({ type: 'integer', description: '赠送的积分' })
  @Column({ name: 'gift_point', default: 0 })
  giftPoint: number;

  @ApiPropertyOptional({ type: 'integer', description: '限制使用的积分数' })
  @Column({ name: 'use_point_limit', type: 'int', nullable: true })
  usePointLimit: number | null;

  @ApiPropertyOptional({ description: '副标题', type: String })
  @Column({ name: 'sub_title', type: 'varchar', length: 255, nullable: true })
  subTitle: string | null;

  @ApiPropertyOptional({ description: '商品描述', type: String })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiPropertyOptional({ description: '市场价', type: 'number' })
  @Column({
    name: 'original_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  originalPrice: string | null;

  @ApiProperty({ type: 'integer', description: '库存' })
  @Column({ default: 0 })
  stock: number;

  @ApiProperty({ type: 'integer', description: '库存预警值' })
  @Column({ name: 'low_stock', default: 0 })
  lowStock: number;

  @ApiPropertyOptional({ description: '单位', type: String })
  @Column({ type: 'varchar', length: 16, nullable: true })
  unit: string | null;

  @ApiPropertyOptional({ description: '商品重量（克）', type: 'number' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weight: string | null;

  @ApiProperty({ type: 'integer', description: '是否为预告商品' })
  @Column({ name: 'preview_status', default: 0 })
  previewStatus: number;

  @ApiPropertyOptional({
    description: '产品服务：1-无忧退货；2-快速退款；3-免费包邮',
    type: String,
  })
  @Column({ name: 'service_ids', type: 'varchar', length: 64, nullable: true })
  serviceIds: string | null;

  @ApiPropertyOptional({ description: '关键字', type: String })
  @Column({ type: 'varchar', length: 255, nullable: true })
  keywords: string | null;

  @ApiPropertyOptional({ description: '备注', type: String })
  @Column({ type: 'varchar', length: 255, nullable: true })
  note: string | null;

  @ApiPropertyOptional({
    description: '画册图片，连产品图片限制为5张，以逗号分割',
    type: String,
  })
  @Column({ name: 'album_pics', type: 'text', nullable: true })
  albumPics: string | null;

  @ApiPropertyOptional({ description: '详情标题', type: String })
  @Column({
    name: 'detail_title',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  detailTitle: string | null;

  @ApiPropertyOptional({ description: '详情描述', type: String })
  @Column({ name: 'detail_desc', type: 'text', nullable: true })
  detailDesc: string | null;

  @ApiPropertyOptional({ description: '产品详情网页内容', type: String })
  @Column({ name: 'detail_html', type: 'text', nullable: true })
  detailHtml: string | null;

  @ApiPropertyOptional({ description: '移动端网页详情', type: String })
  @Column({ name: 'detail_mobile_html', type: 'text', nullable: true })
  detailMobileHtml: string | null;

  @ApiPropertyOptional({
    description: '促销开始时间',
    type: String,
    format: 'date-time',
  })
  @Column({ name: 'promotion_start_time', type: 'timestamp', nullable: true })
  promotionStartTime: Date | null;

  @ApiPropertyOptional({
    description: '促销结束时间',
    type: String,
    format: 'date-time',
  })
  @Column({ name: 'promotion_end_time', type: 'timestamp', nullable: true })
  promotionEndTime: Date | null;

  @ApiPropertyOptional({ description: '活动限购数量', type: Number })
  @Column({
    name: 'promotion_per_limit',
    type: 'int',
    nullable: true,
    comment: '活动限购数量',
  })
  promotionPerLimit: number | null;

  @ApiProperty({
    description: '促销类型：0-无优惠；1-特惠；2-会员价；3-阶梯价；4-满减',
    type: 'integer',
    enum: [0, 1, 2, 3, 4],
  })
  @Column({
    name: 'promotion_type',
    default: 0,
    comment: '促销类型：0-无优惠；1-特惠；2-会员价；3-阶梯价；4-满减',
  })
  promotionType: number;

  @ApiProperty({ description: '创建时间', format: 'date-time' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间', format: 'date-time' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // ---- Relations ----

  @ManyToOne(() => BrandEntity, {
    createForeignKeyConstraints: false,
    eager: false,
    nullable: true,
  })
  @JoinColumn({ name: 'brand_id' })
  brand: BrandEntity;

  @ManyToOne(() => ProductCategoryEntity, {
    createForeignKeyConstraints: false,
    eager: false,
    nullable: true,
  })
  @JoinColumn({ name: 'product_category_id' })
  productCategory: ProductCategoryEntity;

  @OneToMany(() => SkuStockEntity, (sku) => sku.product, {
    cascade: ['insert', 'update'],
  })
  skuStocks: SkuStockEntity[];

  @OneToMany(() => ProductAttrValueEntity, (attr) => attr.product, {
    cascade: ['insert', 'update'],
  })
  productAttrValues: ProductAttrValueEntity[];

  @OneToMany(() => ProductLadderEntity, (ladder) => ladder.product, {
    cascade: ['insert', 'update'],
  })
  productLadders: ProductLadderEntity[];

  @OneToMany(
    () => ProductFullReductionEntity,
    (reduction) => reduction.product,
    { cascade: ['insert', 'update'] },
  )
  productFullReductions: ProductFullReductionEntity[];

  @OneToMany(() => MemberPriceEntity, (mp) => mp.product, {
    cascade: ['insert', 'update'],
  })
  memberPrices: MemberPriceEntity[];
}
