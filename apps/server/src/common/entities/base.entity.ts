import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

/**
 * 基础实体 — 提供主键、时间戳、软删除
 * 所有新实体应继承此类
 *
 * 使用 TypeORM 原生 @DeleteDateColumn 实现软删除：
 * - repo.softDelete(id) 或 repo.softRemove(entity) 标记删除
 * - repo.find() 自动过滤已删除记录
 * - repo.find({ withDeleted: true }) 查询包含已删除记录
 * - repo.restore(id) 恢复已删除记录
 */
export abstract class BaseEntity {
  @ApiProperty({ description: '主键ID', type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: '删除时间' })
  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
