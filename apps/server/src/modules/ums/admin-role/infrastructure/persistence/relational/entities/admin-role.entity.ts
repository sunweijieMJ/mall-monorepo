import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('ums_role')
export class AdminRoleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, comment: '名称' })
  name: string;

  @Column({ length: 100, nullable: true, comment: '描述' })
  description: string;

  @Column({ default: 0, comment: '管理员数量' })
  adminCount: number;

  @Column({ default: 1, comment: '启用状态：0->禁用；1->启用' })
  status: number;

  @Column({ default: 0 })
  sort: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
