import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('ums_role_menu_relation')
@Unique(['roleId', 'menuId'])
export class RoleMenuRelationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'role_id', nullable: false, comment: '角色ID' })
  roleId: number;

  @Column({ name: 'menu_id', nullable: false, comment: '菜单ID' })
  menuId: number;
}
