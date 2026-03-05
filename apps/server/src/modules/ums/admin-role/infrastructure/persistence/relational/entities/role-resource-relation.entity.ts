import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ums_role_resource_relation')
export class RoleResourceRelationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'role_id', nullable: true, comment: '角色ID' })
  roleId: number;

  @Column({ name: 'resource_id', nullable: true, comment: '资源ID' })
  resourceId: number;
}
