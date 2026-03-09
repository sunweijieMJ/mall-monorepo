import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';

@Entity('ums_resource')
export class AdminResourceEntity extends BaseEntity {
  @ApiPropertyOptional({ description: '分类ID', type: 'integer' })
  @Column({ name: 'category_id', nullable: true })
  categoryId: number;

  @ApiProperty({ description: '资源名称' })
  @Column({ length: 200 })
  name: string;

  @ApiProperty({ description: '资源URL' })
  @Column({ length: 200 })
  url: string;

  @ApiPropertyOptional({ description: '描述' })
  @Column({ length: 200, nullable: true })
  description: string;
}

@Entity('ums_resource_category')
export class AdminResourceCategoryEntity extends BaseEntity {
  @ApiProperty({ description: '分类名称' })
  @Column({ length: 200 })
  name: string;

  @ApiProperty({ type: 'integer', description: '排序' })
  @Column({ default: 0 })
  sort: number;
}
