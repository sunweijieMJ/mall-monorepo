import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('oms_order_return_reason')
export class ReturnReasonEntity {
  @ApiProperty({ description: '主键 ID', type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '退货原因名称' })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({ type: 'integer', description: '排序' })
  @Column({ default: 0 })
  sort: number;

  @ApiProperty({
    description: '状态：0->不可用；1->可用',
    type: 'integer',
    enum: [0, 1],
  })
  @Column({ default: 1, comment: '状态：0->不可用；1->可用' })
  status: number;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
