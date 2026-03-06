import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('sms_flash_promotion')
export class FlashPromotionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Index()
  @Column({ default: 0, comment: '上下线状态：0-下线；1-上线' })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('sms_flash_promotion_session')
export class FlashSessionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  name: string;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @Column({ default: 1, comment: '启用状态：0->不启用；1->启用' })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

/** 秒杀商品关联表 */
@Entity('sms_flash_promotion_product_relation')
export class FlashProductRelationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'flash_promotion_id' })
  flashPromotionId: number;

  @Index()
  @Column({ name: 'flash_promotion_session_id' })
  flashPromotionSessionId: number;

  @Column({ name: 'product_id' })
  productId: number;

  @Column({
    name: 'flash_promotion_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '秒杀价格',
  })
  flashPromotionPrice: string;

  @Column({ name: 'flash_promotion_count', comment: '秒杀数量' })
  flashPromotionCount: number;

  @Column({ name: 'flash_promotion_limit', comment: '每人限购数量' })
  flashPromotionLimit: number;

  @Column({ default: 0 })
  sort: number;
}
