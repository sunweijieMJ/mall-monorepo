import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ums_menu')
export class AdminMenuEntity {
  @ApiProperty({ description: '主键ID', type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiPropertyOptional({ description: '父级ID', type: 'integer' })
  @Column({ name: 'parent_id', nullable: true, comment: '父级ID' })
  parentId: number;

  @ApiProperty({ type: 'integer', description: '菜单级数' })
  @Column({ default: 0, comment: '菜单级数' })
  level: number;

  @ApiProperty({ description: '菜单名称' })
  @Column({ length: 100 })
  name: string;

  @ApiPropertyOptional({ description: '前端名称' })
  @Column({ length: 200, nullable: true, comment: '前端名称' })
  title: string;

  @ApiPropertyOptional({ description: '菜单图标' })
  @Column({ length: 200, nullable: true, comment: '菜单图标' })
  icon: string;

  @ApiPropertyOptional({
    description: '前端隐藏：0->不隐藏；1->隐藏',
    type: 'integer',
    enum: [0, 1],
  })
  @Column({
    default: 0,
    comment: '前端隐藏：0->不隐藏；1->隐藏',
  })
  hidden: number;

  @ApiPropertyOptional({ description: '是否缓存' })
  @Column({ length: 200, nullable: true })
  keepAlive: string;

  @ApiPropertyOptional({ description: '前端路由路径' })
  @Column({ length: 200, nullable: true, comment: '前端路由路径' })
  component: string;

  @ApiPropertyOptional({ description: '路由路径' })
  @Column({ length: 200, nullable: true })
  path: string;

  @ApiProperty({ type: 'integer', description: '排序' })
  @Column({ default: 0 })
  sort: number;
}
