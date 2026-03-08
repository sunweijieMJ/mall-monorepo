import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('ums_role')
export class AdminRoleEntity {
  @ApiProperty({ description: '主键ID', type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '名称' })
  @Column({ length: 100, comment: '名称' })
  name: string;

  @ApiPropertyOptional({ description: '描述' })
  @Column({ length: 100, nullable: true, comment: '描述' })
  description: string;

  @ApiProperty({ type: 'integer', description: '管理员数量' })
  @Column({ default: 0, comment: '管理员数量' })
  adminCount: number;

  @ApiProperty({
    description: '启用状态：0->禁用；1->启用',
    type: 'integer',
    enum: [0, 1],
  })
  @Column({ default: 1, comment: '启用状态：0->禁用；1->启用' })
  status: number;

  @ApiProperty({ type: 'integer', description: '排序' })
  @Column({ default: 0 })
  sort: number;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
