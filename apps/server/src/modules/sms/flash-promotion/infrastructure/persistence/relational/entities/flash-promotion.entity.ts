import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('sms_flash_promotion')
export class FlashPromotionEntity {
  @ApiProperty({ description: '主键ID', type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '活动标题' })
  @Column({ length: 200 })
  title: string;

  @ApiProperty({ description: '开始日期' })
  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @ApiProperty({ description: '结束日期' })
  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @ApiProperty({
    description: '上下线状态：0-下线；1-上线',
    type: 'integer',
    enum: [0, 1],
  })
  @Index()
  @Column({ default: 0, comment: '上下线状态：0-下线；1-上线' })
  status: number;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('sms_flash_promotion_session')
export class FlashSessionEntity {
  @ApiProperty({ description: '主键ID', type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '场次名称' })
  @Column({ length: 200 })
  name: string;

  @ApiProperty({ description: '开始时间（每日）' })
  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @ApiProperty({ description: '结束时间（每日）' })
  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @ApiProperty({
    description: '启用状态：0->不启用；1->启用',
    type: 'integer',
    enum: [0, 1],
  })
  @Column({ default: 1, comment: '启用状态：0->不启用；1->启用' })
  status: number;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

/** 秒杀商品关联表 */
@Entity('sms_flash_promotion_product_relation')
export class FlashProductRelationEntity {
  @ApiProperty({ description: '主键ID', type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '秒杀活动ID', type: 'integer' })
  @Index()
  @Column({ name: 'flash_promotion_id' })
  flashPromotionId: number;

  @ApiProperty({ description: '秒杀场次ID', type: 'integer' })
  @Index()
  @Column({ name: 'flash_promotion_session_id' })
  flashPromotionSessionId: number;

  @ApiProperty({ description: '商品ID', type: 'integer' })
  @Column({ name: 'product_id' })
  productId: number;

  @ApiProperty({ description: '秒杀价格', type: 'number' })
  @Column({
    name: 'flash_promotion_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '秒杀价格',
  })
  flashPromotionPrice: string;

  @ApiProperty({ type: 'integer', description: '秒杀数量' })
  @Column({ name: 'flash_promotion_count', comment: '秒杀数量' })
  flashPromotionCount: number;

  @ApiProperty({ type: 'integer', description: '每人限购数量' })
  @Column({ name: 'flash_promotion_limit', comment: '每人限购数量' })
  flashPromotionLimit: number;

  @ApiProperty({ type: 'integer', description: '排序' })
  @Column({ default: 0 })
  sort: number;
}
