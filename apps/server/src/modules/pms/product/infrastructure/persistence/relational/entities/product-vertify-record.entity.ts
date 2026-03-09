import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('pms_product_vertify_record')
export class ProductVertifyRecordEntity {
  @ApiProperty({ description: '主键ID', type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiPropertyOptional({ description: '商品ID', type: 'integer' })
  @Column({ name: 'product_id', nullable: true })
  productId: number;

  @ApiPropertyOptional({ description: '创建时间', format: 'date-time' })
  @Column({ name: 'create_time', type: 'timestamp', nullable: true })
  createdAt: Date;

  @ApiPropertyOptional({ description: '审核人' })
  @Column({
    name: 'vertify_man',
    length: 64,
    nullable: true,
    comment: '审核人',
  })
  vertifyMan: string;

  @ApiPropertyOptional({ type: 'integer', description: '审核状态' })
  @Column({ nullable: true })
  status: number;

  @ApiPropertyOptional({ description: '反馈详情' })
  @Column({ type: 'varchar', length: 255, nullable: true, comment: '反馈详情' })
  detail: string;
}
