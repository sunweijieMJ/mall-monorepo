import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('ums_role_menu_relation')
@Unique(['roleId', 'menuId'])
export class RoleMenuRelationEntity {
  @ApiProperty({ description: '主键ID', type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '角色ID', type: 'integer' })
  @Column({ name: 'role_id', nullable: false, comment: '角色ID' })
  roleId: number;

  @ApiProperty({ description: '菜单ID', type: 'integer' })
  @Column({ name: 'menu_id', nullable: false, comment: '菜单ID' })
  menuId: number;
}
