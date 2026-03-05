import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ums_role_menu_relation')
export class RoleMenuRelationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'role_id', nullable: true, comment: '角色ID' })
  roleId: number;

  @Column({ name: 'menu_id', nullable: true, comment: '菜单ID' })
  menuId: number;
}
