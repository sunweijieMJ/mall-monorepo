import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('ums_role_resource_relation')
@Unique(['roleId', 'resourceId'])
export class RoleResourceRelationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'role_id', nullable: false, comment: '角色ID' })
  roleId: number;

  @Column({ name: 'resource_id', nullable: false, comment: '资源ID' })
  resourceId: number;
}
