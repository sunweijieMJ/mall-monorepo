import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ums_admin_role_relation')
export class AdminRoleRelationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'admin_id', nullable: true })
  adminId: number;

  @Column({ name: 'role_id', nullable: true })
  roleId: number;
}
