import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ums_menu')
export class AdminMenuEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'parent_id', nullable: true, comment: '父级ID' })
  parentId: number;

  @Column({ default: 0, comment: '菜单级数' })
  level: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 200, nullable: true, comment: '前端名称' })
  title: string;

  @Column({ length: 200, nullable: true, comment: '菜单图标' })
  icon: string;

  @Column({
    length: 200,
    nullable: true,
    comment: '前端隐藏：0->不隐藏；1->隐藏',
  })
  hidden: string;

  @Column({ length: 200, nullable: true })
  keepAlive: string;

  @Column({ length: 200, nullable: true, comment: '前端路由路径' })
  component: string;

  @Column({ length: 200, nullable: true })
  path: string;

  @Column({ default: 0 })
  sort: number;
}
