import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';

@Entity('oms_order_return_reason')
export class ReturnReasonEntity extends BaseEntity {
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
}
