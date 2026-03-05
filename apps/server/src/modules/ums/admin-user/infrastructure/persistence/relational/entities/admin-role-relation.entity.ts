import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('ums_admin_role_relation')
@Unique(['adminId', 'roleId'])
export class AdminRoleRelationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'admin_id', nullable: false })
  adminId: number;

  @Column({ name: 'role_id', nullable: false })
  roleId: number;
}
