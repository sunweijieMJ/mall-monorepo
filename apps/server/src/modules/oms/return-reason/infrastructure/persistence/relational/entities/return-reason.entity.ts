import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('oms_order_return_reason')
export class ReturnReasonEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ default: 0 })
  sort: number;

  @Column({ default: 1, comment: '状态：0->不可用；1->可用' })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
