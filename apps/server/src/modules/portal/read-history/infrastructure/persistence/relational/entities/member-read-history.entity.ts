import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ums_member_product_history')
export class MemberReadHistoryNewEntity {
  @ApiProperty({ description: '主键ID', type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '会员ID', type: 'integer' })
  @Index()
  @Column({ name: 'member_id' })
  memberId: number;

  @ApiProperty({ description: '商品ID', type: 'integer' })
  @Column({ name: 'product_id' })
  productId: number;

  @ApiPropertyOptional({ description: '商品名称' })
  @Column({ name: 'product_name', length: 500, nullable: true })
  productName: string;

  @ApiPropertyOptional({ description: '商品图片' })
  @Column({ name: 'product_pic', type: 'text', nullable: true })
  productPic: string;

  @ApiPropertyOptional({ description: '商品价格', type: 'number' })
  @Column({
    name: 'product_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  productPrice: string | null;

  @ApiPropertyOptional({ description: '浏览时间', format: 'date-time' })
  @Column({ name: 'create_time', type: 'timestamp', nullable: true })
  createdAt: Date;
}
